import { createProxyMiddleware as proxy } from "http-proxy-middleware";
import logger from "./logger";

export const createProxyMiddleware = (serviceUrl: string) => {
  return proxy({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/\/api\/[^/]+\//, "/"),
    logLevel: "debug",
    logProvider: () => logger,
    onProxyReq: (proxyReq, req, res) => {
      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();

        logger.debug(
          `Proxy forwarded request body: ${bodyData.substring(0, 200)}${
            bodyData.length > 200 ? "..." : ""
          }`
        );
      }
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Proxy error", error: err.message }));
      }
    },
  });
};
