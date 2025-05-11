output "ecs_cluster_id" {
  value = aws_ecs_cluster.uptime_monitoring.id
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt_secret.arn
}

output "ecr_repository_url" {
  value = aws_ecr_repository.services.repository_url
}

output "jwt_secret" {
  value     = random_password.jwt_secret.result
  sensitive = true
}

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}

output "gateway_public_ip" {
  value       = aws_eip.gateway_ip.public_ip
  description = "Public IP address for gateway and client services"
}

output "gateway_port" {
  value       = local.services.gateway.port
  description = "Port for the gateway service"
}

output "client_port" {
  value       = local.services.client.port
  description = "Port for the client service"
}

output "client_access_url" {
  value       = "http://${aws_eip.gateway_ip.public_ip}:${local.services.client.port}"
  description = "URL to access the client application"
}

output "gateway_access_url" {
  value       = "http://${aws_eip.gateway_ip.public_ip}:${local.services.gateway.port}"
  description = "URL to access the API gateway"
}
