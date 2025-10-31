# Infrastructure as Code (IaC)

This directory contains all the necessary files for defining, provisioning, and managing the infrastructure for the Rewards Bolivia project.

## Purpose

This includes configurations for:

-   **Cloud Resources:** (e.g., AWS, GCP, Azure) using tools like Terraform or Pulumi.
-   **Container Orchestration:** Kubernetes manifests (`.yaml` files) for deploying and managing our applications.
-   **CI/CD Pipelines:** Configuration related to infrastructure deployment steps.

## Contents

-   `kubernetes/`: Kubernetes deployment, service, and ingress configurations.
-   `terraform/`: Terraform modules and configurations for cloud resource provisioning.
-   `ansible/`: Ansible playbooks for configuration management (if applicable).

This approach ensures that our infrastructure is version-controlled, reproducible, and scalable.
