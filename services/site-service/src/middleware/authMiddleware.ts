import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string } | { service: string };
    }
  }
}

export function validateJWT(req: Request, res: Response, next: NextFunction) {
  logger.debug(
    `[Middleware] Validating JWT token for ${req.method} ${req.url}`
  );

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    logger.warn(
      `[Middleware] Authentication failed: No token provided for ${req.method} ${req.url}`
    );
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as
        | { id: number; email: string; role: string }
        | { service: string };

      if ("id" in req.user) {
        logger.debug(
          `[Middleware] JWT validated for user ID: ${req.user.id}, role: ${req.user.role}`
        );
      } else if ("service" in req.user) {
        logger.debug(
          `[Middleware] JWT validated for service: ${req.user.service}`
        );
      }

      next();
    } else {
      logger.warn(
        `[Middleware] Invalid token format for ${req.method} ${req.url}`
      );
      throw new Error("Invalid token");
    }
  } catch (error) {
    logger.warn(
      `[Middleware] JWT validation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function validateRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.debug(
      `[Middleware] Validating role access for ${req.method} ${req.url}`
    );

    if (
      !req.user ||
      !("role" in req.user) ||
      !roles.includes(req.user.role.toString())
    ) {
      logger.warn(
        `[Middleware] Role validation failed: User ${
          req.user ? ("id" in req.user ? req.user.id : "service") : "undefined"
        } does not have required role(s) ${roles.join(", ")}`
      );
      return res.status(403).json({ message: "Forbidden" });
    }

    logger.debug(
      `[Middleware] Role validation successful: User has required role(s) ${roles.join(
        ", "
      )}`
    );
    next();
  };
}
