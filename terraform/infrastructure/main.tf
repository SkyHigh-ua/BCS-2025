provider "random" {}

resource "random_password" "jwt_secret" {
  length  = 32
  special = false
}

resource "random_password" "db_password" {
  length  = 16
  special = false
}

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

resource "aws_ecs_cluster" "uptime_monitoring" {
  name = "${var.project_name}-ecs"
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "secrets_access" {
  name        = "ECSSecretsAccessPolicy"
  description = "Allow ECS tasks to access secrets in Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
        ]
        Effect = "Allow"
        Resource = [
          aws_secretsmanager_secret.jwt_secret.arn,
          aws_secretsmanager_secret.db_connection.arn,
          aws_secretsmanager_secret.db_password.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "jwt-secret"
  description = "JWT secret for uptime monitoring services"
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = jsonencode({ JWT_SECRET = random_password.jwt_secret.result })
}

resource "aws_secretsmanager_secret" "db_password" {
  name        = "db-password"
  description = "Database password for uptime monitoring services"
}

resource "aws_secretsmanager_secret_version" "db_password_version" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({ DB_PASSWORD = random_password.db_password.result })
}

resource "aws_secretsmanager_secret" "db_connection" {
  name        = "db-connection"
  description = "Database connection string for uptime monitoring services"
}

resource "aws_secretsmanager_secret_version" "db_connection_version" {
  secret_id = aws_secretsmanager_secret.db_connection.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
  })
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-db"
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db_password.result
  publicly_accessible    = false
  skip_final_snapshot    = true
  vpc_security_group_ids = [module.vpc.default_security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
}

resource "aws_db_subnet_group" "postgres" {
  name       = "db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_ecr_repository" "services" {
  name = "${var.project_name}-services"
}

resource "aws_ecs_task_definition" "services" {
  for_each = local.services

  family                   = each.value.name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = each.value.name
      image     = "${aws_ecr_repository.services.repository_url}:${each.value.name}-latest"
      essential = true
      portMappings = [
        {
          containerPort = each.value.port
          hostPort      = each.value.port
        }
      ]
      secrets = each.key == "client" ? [] : [
        { name = "JWT_SECRET", valueFrom = aws_secretsmanager_secret.jwt_secret.arn },
        { name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.db_connection.arn },
      ]
      environment = each.key == "client" ? [
        { name = "NODE_ENV", value = var.env },
        { name = "API_BASE_URL", value = "http://${aws_eip.gateway_ip.public_ip}:${local.services.gateway.port}" }
        ] : [
        { name = "NODE_ENV", value = var.env },
        { name = "GATEWAY_URL", value = "http://${aws_service_discovery_service.gateway.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "USER_SERVICE_URL", value = "http://${aws_service_discovery_service.user_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "RBAC_SERVICE_URL", value = "http://${aws_service_discovery_service.rbac_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "SITE_SERVICE_URL", value = "http://${aws_service_discovery_service.site_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "PLUGIN_SERVICE_URL", value = "http://${aws_service_discovery_service.plugin_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "MODULE_SERVICE_URL", value = "http://${aws_service_discovery_service.module_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "MODULE_CONTROLLER_SERVICE_URL", value = "http://${aws_service_discovery_service.module_controller_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" },
        { name = "SCHEDULER_SERVICE_URL", value = "http://${aws_service_discovery_service.scheduler_service.name}.${aws_service_discovery_private_dns_namespace.main.name}" }
      ]
    }
  ])

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
}

resource "aws_ecs_service" "services" {
  for_each        = local.services
  name            = each.value.name
  cluster         = aws_ecs_cluster.uptime_monitoring.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = each.key == "client" || each.key == "gateway" ? module.vpc.public_subnets : module.vpc.private_subnets
    security_groups  = [module.vpc.default_security_group_id]
    assign_public_ip = each.key == "client" || each.key == "gateway" ? true : false
  }

  dynamic "service_registries" {
    for_each = each.key != "client" ? [1] : []
    content {
      registry_arn = lookup({
        "gateway" : aws_service_discovery_service.gateway.arn,
        "user_service" : aws_service_discovery_service.user_service.arn,
        "rbac_service" : aws_service_discovery_service.rbac_service.arn,
        "site_service" : aws_service_discovery_service.site_service.arn,
        "plugin_service" : aws_service_discovery_service.plugin_service.arn,
        "module_service" : aws_service_discovery_service.module_service.arn,
        "module_controller_service" : aws_service_discovery_service.module_controller_service.arn,
        "scheduler_service" : aws_service_discovery_service.scheduler_service.arn,
        "auth_service" : aws_service_discovery_service.auth_service.arn,
      }, each.key, null)
    }
  }
}

resource "aws_eip" "gateway_ip" {
  domain = "vpc"
  tags = {
    Name = "${var.project_name}-gateway-eip"
  }
}

resource "aws_service_discovery_service" "scheduler_service" {
  name = "scheduler-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "gateway" {
  name = "gateway"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "user_service" {
  name = "user-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "rbac_service" {
  name = "rbac-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "site_service" {
  name = "site-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "plugin_service" {
  name = "plugin-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "module_service" {
  name = "module-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "module_controller_service" {
  name = "module-controller-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_service" "auth_service" {
  name = "auth-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 60
    }
  }
}

resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "local"
  description = "Private DNS namespace for services"
  vpc         = module.vpc.vpc_id
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