import { Request, Response, NextFunction } from "express";

export function validateInternalService(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const internalServiceHeader = req.headers["x-internal-service"];
  if (internalServiceHeader !== "true") {
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid internal service header" });
  }
  next();
}
