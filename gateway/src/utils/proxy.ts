import { createProxyMiddleware as proxy } from "http-proxy-middleware";
import logger from "./logger";

export const createProxyMiddleware = (serviceUrl: string) => {
  return proxy({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/\/api\/[^/]+\//, "/"),
    logLevel: "debug",
    logProvider: () => logger,
  });
};
