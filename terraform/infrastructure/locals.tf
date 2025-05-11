locals {
  services = {
    auth_service              = { name = "auth-service", port = 5001 },
    user_service              = { name = "user-service", port = 5002 },
    rbac_service              = { name = "rbac-service", port = 5003 },
    site_service              = { name = "site-service", port = 5004 },
    plugin_service            = { name = "plugin-service", port = 5005 },
    module_service            = { name = "module-service", port = 5010 },
    module_controller_service = { name = "module-controller-service", port = 5011 },
    scheduler_service         = { name = "scheduler-service", port = 5012 },
    gateway                   = { name = "gateway", port = 3000 }
    client                    = { name = "client", port = 4000 }
  }
}
