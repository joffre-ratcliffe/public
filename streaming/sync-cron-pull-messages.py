from google.cloud import pubsub_v1

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path("my-project-id", "my-subscription-id")

# Pull up to 10 messages, adjust as necessary
response = subscriber.pull(request={"subscription": subscription_path, "max_messages": 10})

for received_message in response.received_messages:
    print(f"Pulled message: {received_message.message.data.decode('utf-8')}")
    
    # Acknowledge receipt
    subscriber.acknowledge(
        request={
            "subscription": subscription_path,
            "ack_ids": [received_message.ack_id],
        }
    )
