import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import axios from "axios";
import { getAuthHeader } from "../utils/authUtils";

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
  logger.info(`[Middleware] fetchModuleInfo started for moduleId: ${moduleId}`);

  try {
    // Fetch module information from the module service
    const moduleServiceUrl =
      process.env.MODULE_SERVICE_URL || "http://module-service:5008";
    logger.debug(
      `[Middleware] Fetching module from: ${moduleServiceUrl}/${moduleId}`
    );

    // Get auth header for service-to-service communication
    const authHeader = getAuthHeader();
    if (!authHeader) {
      logger.error(
        `[Middleware] Failed to generate auth token for module service request`
      );
      res.status(500).json({ message: "Authentication error" });
      return;
    }

    const response = await axios.get(`${moduleServiceUrl}/${moduleId}`, {
      headers: {
        Authorization: authHeader,
      },
    });
    logger.debug(
      `[Middleware] Module service response status: ${response.status}`
    );

    if (!response.data) {
      logger.warn(
        `[Middleware] Module ${moduleId} not found in module service - empty response`
      );
      res.status(404).json({ message: "Module not found" });
      return;
    }

    logger.info(
      `[Middleware] Module ${moduleId} found - name: ${
        response.data.name || "unnamed"
      }`
    );

    // Attach the module info to the request
    req.moduleInfo = response.data;
    logger.debug(
      `[Middleware] Module info attached to request: ${JSON.stringify(
        response.data
      )}`
    );

    // Ensure moduleFolder is available if specified
    if (response.data.moduleFolder) {
      logger.info(
        `[Middleware] Module folder specified: ${response.data.moduleFolder}`
      );
      req.moduleFolder = response.data.moduleFolder;
    }

    // Continue to the next middleware or route handler
    logger.debug(
      `[Middleware] fetchModuleInfo completed for moduleId: ${moduleId}`
    );
    next();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        `[Middleware] Axios error fetching module info: ${error.message}`
      );
      if (error.response) {
        logger.error(
          `[Middleware] Response status: ${
            error.response.status
          }, data: ${JSON.stringify(error.response.data)}`
        );
      }
    } else {
      logger.error(
        `[Middleware] Error fetching module info: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    logger.debug(
      `[Middleware] Stack trace: ${
        error instanceof Error ? error.stack : "No stack trace available"
      }`
    );

    res.status(500).json({
      message: "Failed to fetch module information",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
