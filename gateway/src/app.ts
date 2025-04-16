import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "./utils/proxy";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", createProxyMiddleware("http://auth-service:5001"));
app.use("/api/user", createProxyMiddleware("http://user-service:5002"));
app.use("/api/rbac", createProxyMiddleware("http://rbac-service:5003"));
app.use("/api/sites", createProxyMiddleware("http://site-service:5004"));
app.use("/api/plugins", createProxyMiddleware("http://plugin-service:5005"));
app.use(
  "/api/modules",
  createProxyMiddleware("http://module-controller-service:5010")
);
app.use(
  "/api/scheduler",
  createProxyMiddleware("http://scheduler-service:5011")
);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Error:", err.stack || err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
});
