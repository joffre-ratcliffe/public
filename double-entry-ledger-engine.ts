export class LedgerError extends Error {
  constructor(message: string) {
    super(`LedgerValidationError: ${message}`);
    this.name = 'LedgerError';
  }
}

export class LedgerEngine {
  /**
   * Appends a balanced journal entry within an active database transaction.
   */
  public async createJournalEntry(tx: DatabaseTransaction, input: JournalEntryInput): Promise<string> {
    if (input.postings.length < 2) {
      throw new LedgerError('A journal entry must contain at least two postings.');
    }

    let totalDebits = 0n;
    let totalCredits = 0n;

    for (const posting of input.postings) {
      if (posting.amount <= 0n) {
        throw new LedgerError('Posting amount must be greater than zero.');
      }
      
      if (posting.direction === 'DEBIT') {
        totalDebits += posting.amount;
      } else {
        totalCredits += posting.amount;
      }
    }

    // Enforce the fundamental double-entry invariant
    if (totalDebits !== totalCredits) {
      throw new LedgerError(`Ledger is out of balance. Total Debits: ${totalDebits}, Total Credits: ${totalCredits}`);
    }

    // 1. Insert the Journal Entry Header
    const journalEntryId = 'je_' + Math.random().toString(36).substring(2, 9);
    await tx.query(
      `INSERT INTO journal_entries (id, idempotency_key, description, created_at) VALUES (?, ?, ?, NOW())`,
      [journalEntryId, input.idempotencyKey, input.description]
    );

    // 2. Insert the balanced postings (Ledger Lines)
    for (const posting of input.postings) {
      const postingId = 'post_' + Math.random().toString(36).substring(2, 9);
      
      // Lock the account row to prevent concurrent balance calculation anomalies if necessary
      await tx.query(`SELECT id FROM accounts WHERE id = ? FOR UPDATE`, [posting.accountId]);

      await tx.query(
        `INSERT INTO postings (id, journal_entry_id, account_id, direction, amount) VALUES (?, ?, ?, ?, ?)`,
        [postingId, journalEntryId, posting.accountId, posting.direction, posting.amount]
      );
    }

    return journalEntryId;
  }
}