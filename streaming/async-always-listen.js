// This script establishes a persistent connection to Google Pub/Sub (via subscription) and listens for new messages via a callback function

const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();

function listenForMessages(subscriptionNameOrId) {
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  // Define message handler
  const messageHandler = message => {
    // Process message here
    console.log(`Received message: ${message.data.toString()}`);
    
    // Acknowledge the message
    message.ack();
  };

  // Listen for new messages
  subscription.on('message', messageHandler);
}

listenForMessages('my-subscription-id');
