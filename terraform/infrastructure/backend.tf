terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.93.0"
    }
  }
  backend "s3" {
    key          = "dev/state.tfstate"
    region       = "eu-central-1"
    encrypt      = true
  }
}

provider "aws" {
  region = "eu-central-1"
}
