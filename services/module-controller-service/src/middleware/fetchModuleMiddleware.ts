import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import axios from "axios";

/**
 * Middleware that fetches module information from the module service
 * and attaches it to the request
 */
export const fetchModuleInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { moduleId } = req.params;

  try {
    // Fetch module information from the module service
    const moduleServiceUrl =
      process.env.MODULE_SERVICE_URL || "http://module-service:5008";
    const response = await axios.get(`${moduleServiceUrl}/modules/${moduleId}`);

    if (!response.data) {
      logger.warn(`Module ${moduleId} not found in module service`);
      res.status(404).json({ message: "Module not found" });
      return;
    }

    // Attach the module info to the request
    req.moduleInfo = response.data;

    // Ensure moduleFolder is available if specified
    if (response.data.moduleFolder) {
      req.moduleFolder = response.data.moduleFolder;
    }

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    logger.error(`Error fetching module info: ${error}`);
    res.status(500).json({
      message: "Failed to fetch module information",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
