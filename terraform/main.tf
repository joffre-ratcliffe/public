# HCL markup

provider "google" {
  project = "your-gcp-project-id"
  region  - "us-central1"
}

# Create a service account for the workflow
resource "google_service_account" "workflow_sa" {
  account_id   = "workflow-engine-sa"
  display_name = "Workflow Service Account"
}

# Grant necessary IAM roles to the service account here if required...

# Define the Google Cloud Workflow resource
resource "google_workflows_workflow" "example" {
  name                = "sample-workflow"
  region              = "us-central1"
  description         = "A sample workflow deployed via Terraform HCL"
  service_account     = google_service_account.workflow_sa.id
  deletion_protection = false

  # Note: Escape dollar signs as $${...} for Terraform interpolation in workflow source code
  source_contents = <<-EOF
    main:
      steps:
        - getCurrentTime:
            call: http.get
            args:
              url: https://timeapi.io
            result: CurrentDateTime
        - returnOutput:
            return: $${CurrentDateTime.body.dayOfWeek}
  EOF
}

output "workflow_id" {
  value       = google_workflows_workflow.example.id
  description = "The fully qualified ID of the workflow."
}
```

### Key Requirements
* **API Enablement**: Ensure the `workflows.googleapis.com` service is enabled on your Google Cloud project.
* **Escaping Expressions**: In HCL `source_contents`, workflow expressions using `${...}` must be escaped as `$${...}` to prevent Terraform from treating them as local variables or input variables.
