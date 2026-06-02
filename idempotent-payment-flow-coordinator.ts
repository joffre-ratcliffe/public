export interface PaymentIntent {
  idempotencyKey: string;
  amount: bigint;
  customerId: string;
  ticketId: string;
}

export class ConcurrentRequestError extends Error {
  constructor() {
    super('Transaction is already in-flight. Please retry shortly.');
    this.name = 'ConcurrentRequestError';
  }
}

export class PaymentProcessor {
  constructor(
    private ledgerEngine: LedgerEngine,
    private stripeClientMock: any, // External Gateway dependency
    private dbPool: any // Global Database Connection Pool
  ) {}

  public async processTicketPurchase(intent: PaymentIntent): Promise<{ success: boolean; journalEntryId?: string }> {
    // Acquire an isolated database transaction block
    const tx: DatabaseTransaction = await this.dbPool.beginTransaction();

    try {
      // 1. Check Idempotency State inside the transaction block using row-level locking
      const existingKey = await tx.query(
        `SELECT status, response_payload FROM idempotency_keys WHERE key = ? FOR UPDATE`,
        [intent.idempotencyKey]
      );

      if (existingKey.length > 0) {
        const record = existingKey[0];
        
        if (record.status === 'STARTED') {
          // Another concurrent worker thread or container is handling this exact payload right now
          throw new ConcurrentRequestError();
        }
        
        if (record.status === 'COMPLETED') {
          await tx.rollback(); // No work needed, discard transaction safely
          return JSON.parse(record.response_payload);
        }
      }

      // 2. Claim the key to block concurrent racing threads
      await tx.query(
        `INSERT INTO idempotency_keys (key, status, created_at) VALUES (?, 'STARTED', NOW())
         ON DUPLICATE KEY UPDATE status = status`, // Database-level safety rail
        [intent.idempotencyKey]
      );
      
      // Commit the 'STARTED' state early or maintain the lock depending on isolation level preferences.
      // For this runtime architecture, we keep the transaction open to keep the lock tight.

      // 3. Execute the Side Effect (External Payment Gateway) OUTSIDE any tight lock if possible,
      // but if the ledger entry relies on the gateway success, we execute carefully:
      const chargeResult = await this.stripeClientMock.charges.create({
        amount: Number(intent.amount), // Gateway conversion requirement
        currency: 'usd',
        idempotency_key: intent.idempotencyKey // Pass down downstream
      });

      if (!chargeResult.successful) {
        await tx.query(`UPDATE idempotency_keys SET status = 'FAILED' WHERE key = ?`, [intent.idempotencyKey]);
        await tx.commit();
        return { success: false };
      }

      // 4. Construct balanced journal entries for the transaction
      // Scenario: Customer buys a ticket. Cash Clearing asset increases (Debit), Deferred Revenue liability increases (Credit).
      const journalInput: JournalEntryInput = {
        idempotencyKey: intent.idempotencyKey,
        description: `Ticket Purchase - Ticket ID: ${intent.ticketId}`,
        postings: [
          {
            accountId: 'acc_cash_clearing_123', // Asset Account
            direction: 'DEBIT',
            amount: intent.amount
          },
          {
            accountId: 'acc_deferred_revenue_456', // Liability Account
            direction: 'CREDIT',
            amount: intent.amount
          }
        ]
      };

      const journalEntryId = await this.ledgerEngine.createJournalEntry(tx, journalInput);

      // 5. Finalize the Idempotency state
      const successPayload = { success: true, journalEntryId };
      await tx.query(
        `UPDATE idempotency_keys SET status = 'COMPLETED', response_payload = ? WHERE key = ?`,
        [JSON.stringify(successPayload), intent.idempotencyKey]
      );

      await tx.commit();
      return successPayload;

    } catch (error) {
      await tx.rollback();
      
      if (error instanceof ConcurrentRequestError) {
        throw error; // Let the global router return a 409 or Retry-After
      }

      // Route unforeseen engineering crashes safely
      await this.routeToExceptionQueue(intent, error);
      throw error;
    }
  }

  private async routeToExceptionQueue(intent: PaymentIntent, error: any): Promise<void> {
    console.error(`CRITICAL: Payment flow crashed for key: ${intent.idempotencyKey}. Routing to DLQ.`, error);
    // Code here would push the payload to RabbitMQ, AWS SQS, or a dedicated database exception table
  }
}