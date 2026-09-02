const functions = require('@functions-framework/http');
const express = require('express');
const { KeyManagementServiceClient } = require('@google-cloud/kms');
const axios = require('axios');

const app = express();
app.use(express.json());

// Initialize KMS client globally for container connection reuse
const kmsClient = new KeyManagementServiceClient();
const KMS_KEY_NAME = process.env.KMS_KEY_NAME;
const INSURANCE_API_URL = process.env.INSURANCE_API_URL;
const INSURANCE_API_KEY = process.env.INSURANCE_API_KEY;

/**
 * Encrypts a sensitive string field using Google Cloud KMS (Application-Layer Encryption).
 */
async function encryptSensitiveField(plaintext) {
  if (!plaintext) return null;
  const plaintextBuffer = Buffer.from(plaintext, 'utf8');
  const [result] = await kmsClient.encrypt({
    name: KMS_KEY_NAME,
    plaintext: plaintextBuffer,
  });
  return Buffer.from(result.ciphertext).toString('base64');
}

// POST endpoint for health insurance data transmission
app.post('/push-health-data', async (req, res) => {
  try {
    const { id, user_name, item_name, birth_date, created_date_time } = req.body;

    // Validate mandatory fields following strict REST standards
    if (!id || !user_name || !birth_date) {
      return res.status(422).json({
        error: 'Unprocessable Entity',
        message: 'Missing mandatory fields: id, user_name, and birth_date are required.',
      });
    }

    if (!KMS_KEY_NAME || !INSURANCE_API_URL) {
      console.error('Server configuration error: Missing critical environment variables.');
      return res.status(500).json({ error: 'Internal Server Configuration Error' });
    }

    // Encrypt ePHI (birth_date) prior to external transmission/storage for HIPAA compliance
    const encryptedBirthDate = await encryptSensitiveField(birth_date);

    // Build payload conforming to health insurance provider specifications
    const payload = {
      id,
      user_name,
      item_name,
      birth_date_encrypted: encryptedBirthDate,
      created_date_time: created_date_time || new Date().toISOString(),
    };

    // Push securely to the insurance provider's REST API endpoint
    const providerResponse = await axios.post(INSURANCE_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INSURANCE_API_KEY}`,
      },
      timeout: 10000,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data successfully encrypted and pushed to insurance provider.',
      record_id: id,
      provider_status: providerResponse.status,
    });

  } catch (error) {
    console.error('Data transmission pipeline failure:', error.message);

    if (error.response) {
      return res.status(502).json({
        error: 'Bad Gateway',
        message: 'Health insurance provider endpoint rejected the payload.',
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected processing error occurred.',
    });
  }
});

// Register Express application with Google Cloud Functions Framework
functions.http('pushHealthData', app);
