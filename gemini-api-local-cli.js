console.log("Current Project ID:", process.env.GOOGLE_CLOUD_PROJECT);

if (!process.env.GOOGLE_CLOUD_PROJECT) {
    throw new Error("Project ID is missing! Make sure it is set in your environment.");
}

// Use the official Vertex AI package
const { VertexAI } = require('@google-cloud/vertexai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'; // 'global' is often restricted for certain models

async function generateContent(projectId = GOOGLE_CLOUD_PROJECT, location = GOOGLE_CLOUD_LOCATION) {
  
  // Initialize Vertex AI
  const vertexAI = new VertexAI({ project: projectId, location: location });

  // Instantiate the model
  const model = vertexAI.getGenerativeModel({
    model: 'gemini-2.5-flash', 
  });

  try {
    const request = {
      // Structure MUST be an array of content objects
      contents: [{ role: 'user', parts: [{ text: 'How does AI work?' }] }],
    };

    const result = await model.generateContent(request);
    
    // Accessing the response text in Vertex AI SDK
    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text;
    
    console.log(text);
    return text;
  } catch (err) {
    // This will tell you EXACTLY what field is failing (e.g., "Model not found")
    console.error("Status Code:", err.status);
    console.error("Error Detail:", JSON.stringify(err.response?.data || err, null, 2));
  }
}

generateContent();
