import { createProxyMiddleware as proxy } from "http-proxy-middleware";
import logger from "./logger";

export const createProxyMiddleware = (serviceUrl: string) => {
  return proxy({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/\/api\/[^/]+\//, ""),
    logLevel: "debug",
    logger: {
      log: (message: string) => logger.info(message),
      debug: (message: string) => logger.debug(message),
      info: (message: string) => logger.info(message),
      warn: (message: string) => logger.warn(message),
      error: (message: string) => logger.error(message),
    },
  });
};
