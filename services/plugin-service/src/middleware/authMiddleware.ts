import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string } | { service: string };
    }
  }
}

export function validateRole(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
}
