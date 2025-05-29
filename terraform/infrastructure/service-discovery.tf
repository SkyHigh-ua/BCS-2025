resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "local"
  description = "Private DNS namespace for services"
  vpc         = module.vpc.vpc_id
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
