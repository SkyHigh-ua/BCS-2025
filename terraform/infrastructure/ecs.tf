resource "aws_ecs_cluster" "uptime_monitoring" {
  name = "${var.project_name}-ecs"
}

resource "aws_ecr_repository" "services" {
  name = "${var.project_name}-services"
}

resource "aws_ecs_task_definition" "services" {
  for_each = local.services

  family                   = each.value.name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory

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