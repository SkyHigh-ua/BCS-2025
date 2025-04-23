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
