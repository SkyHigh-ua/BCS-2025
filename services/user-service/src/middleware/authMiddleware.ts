import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const validateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    logger.warn("No token provided in the request");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    logger.debug("Token validated successfully");
    next();
  } catch (error) {
    logger.error("Invalid token", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
