# 1. The Trigger: Pub/Sub Topic for storage events
resource "google_pubsub_topic" "bucket_events" {
  name = "gcs-security-events"
}

# 2. The Identity: Service Account with minimal privileges
resource "google_service_account" "fn_runner" {
  account_id   = "security-remediator-sa"
  display_name = "Cloud Function Security Runner"
}

# 3. The Security Link: Grant IAM roles to the Function
resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.fn_runner.email}"
}

# 4. The Automation: The Cloud Function itself
resource "google_cloudfunctions_function" "remediator" {
  name    = "gcs-public-bucket-remediator"
  runtime = "nodejs18"
  region  = var.region

  source_archive_bucket = google_storage_bucket.source_bucket.name
  source_archive_object = google_storage_bucket_object.zip_upload.name
  
  # Connects the function seamlessly to the service account
  service_account_email = google_service_account.fn_runner.email

  # Connects the function seamlessly to the event stream
  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.bucket_events.id
  }
}
