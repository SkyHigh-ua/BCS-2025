locals {
  services = {
    auth_service              = { name = "auth-service", port = 5001, cpu = 256, memory = 512 },
    user_service              = { name = "user-service", port = 5002, cpu = 256, memory = 512 },
    rbac_service              = { name = "rbac-service", port = 5003, cpu = 256, memory = 512 },
    site_service              = { name = "site-service", port = 5004, cpu = 256, memory = 512 },
    plugin_service            = { name = "plugin-service", port = 5005, cpu = 256, memory = 512 },
    module_service            = { name = "module-service", port = 5010, cpu = 256, memory = 512 },
    module_controller_service = { name = "module-controller-service", port = 5011, cpu = 256, memory = 1024 },
    scheduler_service         = { name = "scheduler-service", port = 5012, cpu = 256, memory = 512 },
    gateway                   = { name = "gateway", port = 4000, cpu = 256, memory = 1024 }
    client                    = { name = "client", port = 3000, cpu = 512, memory = 4096 }
  }
}
