variable "aws_region" {
  description = "AWS region for the S3 bucket"
  type        = string
  default     = "eu-central-1"
}

variable "env" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}
