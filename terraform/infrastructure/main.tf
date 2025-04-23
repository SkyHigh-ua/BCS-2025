provider "random" {}

resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

resource "random_password" "db_password" {
  length  = 16
  special = true
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
      secrets = [
        { name = "JWT_SECRET", valueFrom = aws_secretsmanager_secret.jwt_secret.arn },
        { name = "DB_PASSWORD", valueFrom = aws_secretsmanager_secret.db_password.arn }
      ]
      environment = [
        { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}" },
        { name = "NODE_ENV", value = var.env }
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
    subnets          = module.vpc.public_subnets
    security_groups  = [module.vpc.default_security_group_id]
    assign_public_ip = true
  }
}
