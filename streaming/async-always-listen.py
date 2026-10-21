# This script establishes a persistent connection to Google Pub/Sub (via subscription) and listens for new messages via a callback function

import os
from google.cloud import pubsub_v1

# Define project and subscription ID
project_id = "my-google-cloud-project-id"
subscription_id = "my-subscription-id"

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_id)

def callback(message: pubsub_v1.subscriber.message.Message) -> None:
    # Process the message here
    print(f"Received message: {message.data.decode('utf-8')}")
    
    # Acknowledge the message so it isn't sent again
    message.ack()

# Start listening to the subscription
streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
print(f"Listening for messages on {subscription_path}...")

# Keep the main thread alive to continue listening
try:
    streaming_pull_future.result()
except KeyboardInterrupt:
    streaming_pull_future.cancel()  # Trigger clean shutdown
    streaming_pull_future.result()  # Block until shutdown is complete
