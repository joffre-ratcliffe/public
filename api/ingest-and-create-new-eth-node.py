import datetime
import os
import functions_framework
from web3 import Web3

# Initialize Web3 provider from environment variables (e.g., Infura, Alchemy, or a private node)
WEB3_PROVIDER_URI = os.environ.get("WEB3_PROVIDER_URI")
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER_URI))

# Blockchain configurations
PRIVATE_KEY = os.environ.get("ETHEREUM_PRIVATE_KEY")
SENDER_ADDRESS = os.environ.get("ETHEREUM_SENDER_ADDRESS")
CONTRACT_ADDRESS = os.environ.get("ETHEREUM_CONTRACT_ADDRESS")

# Minimal ABI for a sample contract method: recordTransaction(...)
# Adjust this to match your deployed smart contract ABI
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "transactionId", "type": "string"},
            {"internalType": "string", "name": "price", "type": "string"},
            {"internalType": "string", "name": "gtin", "type": "string"},
            {"internalType": "string", "name": "upc", "type": "string"},
            {"internalType": "string", "name": "productName", "type": "string"},
            {"internalType": "string", "name": "timestamp", "type": "string"},
        ],
        "name": "recordTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    }
]


@functions_framework.http
def create_blockchain_record(request):
  """HTTP Cloud Run Function to ingest transaction data and log it onto Ethereum."""
  if request.method != "POST":
    return (
        {"error": "Method Not Allowed. Use POST."},
        405,
        {"Allow": "POST"},
    )

  request_json = request.get_json(silent=True)
  if not request_json:
    return ({"error": "Bad Request: Invalid or missing JSON payload"}, 400)

  try:
    # Extract payload fields
    transaction_id = str(request_json.get("transaction_id", ""))
    price = str(request_json.get("price", ""))
    gtin = str(request_json.get("gtin", ""))
    upc = str(request_json.get("upc", ""))
    product_name = str(request_json.get("product_name", ""))

    if not transaction_id or not product_name:
      return (
          {"error": "Missing mandatory fields: transaction_id or product_name"},
          422,
      )

    # Add date/time stamp (UTC ISO format)
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Verify connection to the Ethereum network
    if not w3.is_connected():
      return ({"error": "Failed to connect to Ethereum provider"}, 502)

    # Set up smart contract instance
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI
    )

    # Build the transaction
    nonce = w3.eth.get_transaction_count(SENDER_ADDRESS)
    gas_price = w3.eth.gas_price

    tx_func = contract.functions.recordTransaction(
        transaction_id, price, gtin, upc, product_name, timestamp
    )

    # Estimate gas and build transaction payload
    tx_data = tx_func.build_transaction({
        "from": SENDER_ADDRESS,
        "nonce": nonce,
        "gasPrice": gas_price,
        "chainId": w3.eth.chain_id,
    })

    # Sign transaction with private key
    signed_tx = w3.eth.account.sign_transaction(tx_data, private_key=PRIVATE_KEY)

    # Broadcast transaction to the Ethereum network (inclusion in the next block)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    tx_hash_hex = w3.to_hex(tx_hash)

    return (
        {
            "status": "success",
            "message": "Transaction broadcasted to Ethereum network.",
            "transaction_id": transaction_id,
            "timestamp": timestamp,
            "ethereum_tx_hash": tx_hash_hex,
        },
        200,
    )

  except Exception as e:
    print(f"Blockchain submission error: {str(e)}")
    return (
        {"error": "Internal Processing Error", "details": str(e)},
        500,
    )
