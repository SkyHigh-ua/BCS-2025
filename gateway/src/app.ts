import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "./utils/proxy";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/user",
  createProxyMiddleware(
    process.env.USER_SERVICE_URL || "http://user-service.local:5002"
  )
);
app.use(
  "/api/rbac",
  createProxyMiddleware(
    process.env.RBAC_SERVICE_URL || "http://rbac-service.local:5003"
  )
);
app.use(
  "/api/sites",
  createProxyMiddleware(
    process.env.SITE_SERVICE_URL || "http://site-service.local:5004"
  )
);
app.use(
  "/api/plugins",
  createProxyMiddleware(
    process.env.PLUGIN_SERVICE_URL || "http://plugin-service.local:5005"
  )
);
app.use(
  "/api/modules",
  createProxyMiddleware(
    process.env.MODULE_SERVICE_URL ||
      "http://module-controller-service.local:5010"
  )
);
app.use(
  "/api/auth",
  createProxyMiddleware(
    process.env.AUTH_SERVICE_URL || "http://auth-service.local:5001"
  )
);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "dev" ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
});
