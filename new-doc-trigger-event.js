const { onDocumentCreated } = require("firebase-functions/v2/firestore");

exports.onDocumentCreatedHandler = onDocumentCreated("my-collection/{docId}", (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();

  // Check if your specific fields exist and meet criteria
  if (data.status === "active" && data.type === "urgent") {
    // Perform your action here
    console.log(`Processing urgent document: ${event.params.docId}`);
  } else {
    // Exit if criteria are not met
    console.log("Criteria not met, skipping.");
    return;
  }
});
