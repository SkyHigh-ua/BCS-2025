import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string } | { service: string };
    }
  }
}

export function validateJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as
        | { id: number; email: string; role: string }
        | { service: string };
    } else {
      throw new Error("Invalid token");
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
