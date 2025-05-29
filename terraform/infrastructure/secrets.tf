provider "random" {}

resource "random_password" "jwt_secret" {
  length  = 32
  special = false
}

resource "random_password" "db_password" {
  length  = 16
  special = false
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