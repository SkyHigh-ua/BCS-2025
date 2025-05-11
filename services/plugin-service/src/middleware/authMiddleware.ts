import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string } | { service: string };
    }
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
