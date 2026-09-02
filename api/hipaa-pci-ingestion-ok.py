# Uses Google Cloud Run Functions (Python 3.10+) to ingest sensitive data, encrypts high-risk fields via Google Cloud KMS 
# (Client-side/Application-layer encryption) before they hit the db, and stores the payload securely in Firestore
# Some notes - needs organizational BAA, KMS, and environment variable assignment via gcloud
# Ensure least-privilege IAM - roles/cloudkms.cryptoKeyEncrypterDecrypter

import base64
import os
import functions_framework
from google.cloud import firestore, kms

# Initialize clients globally for connection reuse across container instances
db = firestore.Client()
kms_client = kms.KeyManagementServiceClient()

# Retrieve the Cloud KMS Key Resource Name from environment variables
KMS_KEY_NAME = os.environ.get("KMS_KEY_NAME")


def encrypt_sensitive_field(plaintext: str) -> str:
  """Encrypts a plaintext string using Google Cloud KMS and returns base64 ciphertext."""
  if not plaintext:
    return None

  plaintext_bytes = plaintext.encode("utf-8")
  response = kms_client.encrypt(
      request={"name": KMS_KEY_NAME, "plaintext": plaintext_bytes}
  )
  return base64.b64encode(response.ciphertext).decode("utf-8")


@functions_framework.http
def ingest_hipaa_data(request):
  """HTTP Cloud Run Function to receive, encrypt, and store sensitive records."""
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
    # Extract payload fields (adjust schema to your HIPAA/PII pipeline requirements)
    record_id = request_json.get("record_id")
    non_sensitive_metadata = request_json.get("metadata", {})
    raw_ssn = request_json.get("ssn")
    raw_credit_card = request_json.get("credit_card")

    if not record_id or not (raw_ssn or raw_credit_card):
      return ({"error": "Missing mandatory identifier or sensitive fields"}, 422)

    # Apply Application-Layer Encryption for high-risk fields
    encrypted_ssn = encrypt_sensitive_field(raw_ssn) if raw_ssn else None
    encrypted_cc = (
        encrypt_sensitive_field(raw_credit_card) if raw_credit_card else None
    )

    # Build the document structure for Firestore
    secure_document = {
        "record_id": record_id,
        "metadata": non_sensitive_metadata,
        "ssn_encrypted": encrypted_ssn,
        "credit_card_encrypted": encrypted_cc,
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    # Write to Firestore collection with strict partitioning
    db.collection("secure_regulated_records").document(record_id).set(
        secure_document
    )

    return (
        {
            "status": "success",
            "message": "Data successfully encrypted and persisted.",
            "record_id": record_id,
        },
        200,
    )

  #except Exception as e:
    # Avoid logging sensitive raw data to standard out
  #  print(f"Encryption or storage failure: {str(e)}")
  #  return ({"error": "Internal Processing Error"}, 500)

  except GoogleAPICallError as g_err:
    # Catch Google Cloud API specific errors (KMS or Firestore communication failures)
    print(f"Google Cloud API error encountered: {g_err.message}")
    return (
        {
            "error": "Cloud Service Integration Error",
            "details": "Failed to communicate with encryption or database services.",
        },
        502,
    )

  except ValueError as v_err:
    # Catch configuration or formatting exceptions
    print(f"Value or formatting error: {str(v_err)}")
    return ({"error": "Invalid Request Parameter or Configuration"}, 400)

  except Exception as e:
    # Catch-all block for any other unexpected runtime exceptions
    print(f"Unhandled internal exception: {str(e)}")
    return ({"error": "Internal Processing Error"}, 500)
