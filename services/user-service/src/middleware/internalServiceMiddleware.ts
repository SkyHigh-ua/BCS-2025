import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export function validateInternalService(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.debug(
    `[Middleware] Validating internal service header for ${req.method} ${req.url}`
  );

  const internalServiceHeader = req.headers["x-internal-service"];
  if (internalServiceHeader !== "true") {
    logger.warn(
      `[Middleware] Internal service validation failed: Invalid header value: "${internalServiceHeader}" for ${req.method} ${req.url}`
    );
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid internal service header" });
  }

  logger.debug(
    `[Middleware] Internal service validation successful for ${req.method} ${req.url}`
  );
  next();
}
