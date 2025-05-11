module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.21.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-central-1a", "eu-central-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]

  enable_nat_gateway = true
}

resource "aws_db_subnet_group" "postgres" {
  name       = "db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_eip" "gateway_ip" {
  domain = "vpc"
  tags = {
    Name = "${var.project_name}-gateway-eip"
  }
}

resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.eu-central-1.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  security_group_ids  = [module.vpc.default_security_group_id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project_name}-secretsmanager-endpoint"
  }
}

resource "aws_security_group_rule" "secretsmanager_egress" {
  security_group_id = module.vpc.default_security_group_id
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  prefix_list_ids   = []
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow HTTPS egress to Secrets Manager"
}

resource "aws_security_group_rule" "allow_vpc_ingress" {
  security_group_id = module.vpc.default_security_group_id
  type              = "ingress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  self              = true
  description       = "Allow internal VPC traffic"
}

resource "aws_security_group_rule" "allow_client_ingress" {
  security_group_id = module.vpc.default_security_group_id
  type              = "ingress"
  from_port         = local.services.client.port
  to_port           = local.services.client.port
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow public access to client application"
}

resource "aws_security_group_rule" "allow_gateway_ingress" {
  security_group_id = module.vpc.default_security_group_id
  type              = "ingress"
  from_port         = local.services.gateway.port
  to_port           = local.services.gateway.port
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow public access to API gateway"
}

resource "aws_security_group_rule" "allow_all_egress" {
  security_group_id = module.vpc.default_security_group_id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all outbound traffic"
}