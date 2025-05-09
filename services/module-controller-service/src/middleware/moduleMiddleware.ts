import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { exec } from "child_process";
import logger from "../utils/logger";
import { MODULE_BASE_DIR } from "../utils/constants";

const execPromise = util.promisify(exec);

interface RepoCache {
  [moduleId: string]: {
    path: string;
    lastAccessed: Date;
    repoLink: string;
  };
}

// Singleton repo cache to be shared across requests
const repoCache: RepoCache = {};

// Initialize the module base directory if it doesn't exist
if (!fs.existsSync(MODULE_BASE_DIR)) {
  fs.mkdirSync(MODULE_BASE_DIR, { recursive: true });
}

/**
 * Middleware that ensures a module's repository is cloned and available
 * before proceeding with the request
 */
export const ensureModuleRepo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { moduleId } = req.params;

  try {
    // Get module info from database via the request context
    // We expect the module info to be attached by a previous middleware or route handler
    if (!req.moduleInfo) {
      logger.error(`Module info not found for moduleId: ${moduleId}`);
      res.status(404).json({ message: "Module not found" });
      return;
    }

    const { repoLink } = req.moduleInfo;

    if (!repoLink) {
      logger.error(`No repository link found for module: ${moduleId}`);
      res.status(400).json({ message: "Module has no repository link" });
      return;
    }

    // Get or clone the module repository, using moduleFolder if provided
    const moduleDir = await getModuleDirectory(
      moduleId,
      repoLink,
      req.moduleFolder
    );

    if (!moduleDir) {
      logger.error(`Failed to prepare module directory for module ${moduleId}`);
      res.status(500).json({ message: "Failed to prepare module directory" });
      return;
    }

    // Attach the module directory to the request for use in subsequent handlers
    req.moduleDir = moduleDir;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    logger.error(`Error in ensureModuleRepo middleware: ${error}`);
    res.status(500).json({
      message: "Failed to prepare module repository",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Gets or creates a module directory, using the cache when possible
 */
export const getModuleDirectory = async (
  moduleId: string,
  repoLink: string,
  moduleFolder?: string
): Promise<string | null> => {
  // If no repo link provided, we can't proceed
  if (!repoLink) {
    logger.warn(`No repository link provided for module ${moduleId}`);
    return null;
  }

  // Create a cache key that includes the module folder if present
  const cacheKey = moduleFolder ? `${moduleId}-${moduleFolder}` : moduleId;

  // Check if we have this module in cache and it's still valid
  if (repoCache[cacheKey] && repoCache[cacheKey].repoLink === repoLink) {
    const cachedDir = repoCache[cacheKey].path;

    // Check if directory still exists
    if (fs.existsSync(cachedDir)) {
      logger.info(`Using cached module directory for module ${moduleId}`);
      repoCache[cacheKey].lastAccessed = new Date();
      return cachedDir;
    }
  }

  // Create a new directory for this module
  const tempDir = path.join(
    MODULE_BASE_DIR,
    `module-${moduleId}-${Date.now()}`
  );
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Clone the repository
  logger.info(`Cloning repository from ${repoLink}`);
  try {
    await execPromise(`git clone ${repoLink} ${tempDir}`);

    // Install dependencies
    logger.info(`Installing dependencies for module ${moduleId}`);
    try {
      await execPromise(`cd ${tempDir} && npm install`);
      logger.info(`Successfully installed dependencies for module ${moduleId}`);
    } catch (npmError) {
      logger.warn(
        `Error installing dependencies: ${npmError}. Continuing anyway.`
      );
      // We continue even if npm install fails, as the module might not need dependencies
    }

    // If moduleFolder is specified, create the final directory and copy only that folder
    let moduleDir = tempDir;

    if (moduleFolder) {
      const sourcePath = path.join(tempDir, moduleFolder);

      // Check if the specified folder exists in the repo
      if (!fs.existsSync(sourcePath)) {
        logger.error(`Module folder '${moduleFolder}' not found in repository`);
        return null;
      }

      // Create a new directory with only the specified module folder
      moduleDir = path.join(
        MODULE_BASE_DIR,
        `module-${moduleId}-folder-${Date.now()}`
      );

      if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true });
      }

      // Copy the specified folder to the new directory
      logger.info(`Copying module folder '${moduleFolder}' to ${moduleDir}`);

      // Use cp -r for recursive copy (works on macOS and Linux)
      await execPromise(`cp -r ${sourcePath}/* ${moduleDir}/`);

      // Clean up the temporary clone directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      logger.info(
        `Successfully copied module folder and cleaned up temp directory`
      );
    }

    // Add to cache
    repoCache[cacheKey] = {
      path: moduleDir,
      lastAccessed: new Date(),
      repoLink: repoLink,
    };

    return moduleDir;
  } catch (error) {
    logger.error(`Error preparing module directory: ${error}`);
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    return null;
  }
};

/**
 * Find the module.ts file in the module directory
 */
export const findModuleFile = async (
  dir: string
): Promise<{ moduleTs?: string; moduleJson?: string; widgetTs?: string }> => {
  try {
    // Look for module.ts, widget.tsx, or similar files
    const files = await fs.promises.readdir(dir, { withFileTypes: true });

    const result: {
      moduleTs?: string;
      moduleJson?: string;
      widgetTs?: string;
    } = {};

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Recursive search in subdirectories
        const subDirResults = await findModuleFile(fullPath);
        if (subDirResults.moduleTs) result.moduleTs = subDirResults.moduleTs;
        if (subDirResults.moduleJson)
          result.moduleJson = subDirResults.moduleJson;
        if (subDirResults.widgetTs) result.widgetTs = subDirResults.widgetTs;
      } else if (file.name.toLowerCase() === "module.ts") {
        result.moduleTs = fullPath;
      } else if (file.name.toLowerCase() === "module.json") {
        result.moduleJson = fullPath;
      } else if (file.name.toLowerCase() === "widget.tsx") {
        result.widgetTs = fullPath;
      }
    }

    return result;
  } catch (error) {
    logger.error(`Error finding module files: ${error}`);
    return {};
  }
};

// Add type definitions to the Express Request interface
declare global {
  namespace Express {
    interface Request {
      moduleInfo?: any;
      moduleDir?: string;
      moduleFolder?: string;
    }
  }
}
