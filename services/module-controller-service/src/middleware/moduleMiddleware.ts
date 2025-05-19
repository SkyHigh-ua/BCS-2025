import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { exec } from "child_process";
import logger from "../utils/logger";
import { MODULE_BASE_DIR } from "../utils/constants";
import { getAuthHeader } from "../utils/authUtils";

const execPromise = util.promisify(exec);

// Locks for module directory preparation to prevent multiple simultaneous creation
interface ModuleDirLock {
  [moduleKey: string]: Promise<string | null>;
}

const moduleDirLocks: ModuleDirLock = {};

interface RepoCache {
  [moduleId: string]: {
    path: string;
    lastAccessed: Date;
    repo_link: string;
  };
}

// Singleton repo cache to be shared across requests
const repoCache: RepoCache = {};

// Export a function to get the repo cache for use by the cleanup service
export function getRepoCache(): RepoCache {
  return repoCache;
}

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

  logger.info(
    `[Middleware] ensureModuleRepo started for moduleId: ${moduleId}`
  );

  try {
    // Get module info from database via the request context
    // We expect the module info to be attached by a previous middleware or route handler
    if (!req.moduleInfo) {
      logger.error(
        `[Middleware] Module info not found for moduleId: ${moduleId}`
      );
      res.status(404).json({ message: "Module not found" });
      return;
    }

    const { repo_link } = req.moduleInfo;
    logger.debug(`[Middleware] Processing repository link: ${repo_link}`);

    if (!repo_link) {
      logger.error(
        `[Middleware] No repository link found for module: ${moduleId}`
      );
      res.status(400).json({ message: "Module has no repository link" });
      return;
    }

    // Get or clone the module repository, using moduleFolder if provided
    logger.info(
      `[Middleware] Preparing module directory for moduleId: ${moduleId}${
        req.moduleFolder ? `, folder: ${req.moduleFolder}` : ""
      }`
    );
    const moduleDir = await getModuleDirectory(
      moduleId,
      repo_link,
      req.moduleFolder
    );

    if (!moduleDir) {
      logger.error(
        `[Middleware] Failed to prepare module directory for module ${moduleId}`
      );
      res.status(500).json({ message: "Failed to prepare module directory" });
      return;
    }

    logger.info(
      `[Middleware] Module directory prepared successfully: ${moduleDir}`
    );

    // Attach the module directory to the request for use in subsequent handlers
    req.moduleDir = moduleDir;

    // Continue to the next middleware or route handler
    logger.debug(
      `[Middleware] ensureModuleRepo completed for moduleId: ${moduleId}`
    );
    next();
  } catch (error) {
    logger.error(
      `[Middleware] Error in ensureModuleRepo middleware: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    logger.debug(
      `[Middleware] Stack trace: ${
        error instanceof Error ? error.stack : "No stack trace available"
      }`
    );
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
  repo_link: string,
  moduleFolder?: string
): Promise<string | null> => {
  // If no repo link provided, we can't proceed
  if (!repo_link) {
    logger.warn(
      `[Module Directory] No repository link provided for module ${moduleId}`
    );
    return null;
  }

  // Parse GitHub repository URL to extract base repo URL and module folder path
  let baseRepoUrl = repo_link;
  let extractedModuleFolder = moduleFolder;

  // Handle GitHub URLs with tree/branch/path format
  const githubTreeMatch = repo_link.match(
    /^(https:\/\/github\.com\/[^\/]+\/[^\/]+)\/tree\/([^\/]+)\/(.+)$/
  );
  if (githubTreeMatch) {
    baseRepoUrl = `${githubTreeMatch[1]}.git`;
    const branch = githubTreeMatch[2];
    extractedModuleFolder = githubTreeMatch[3];

    logger.debug(
      `[Module Directory] Parsed GitHub URL: base=${baseRepoUrl}, branch=${branch}, folder=${extractedModuleFolder}`
    );
  }

  // Use provided moduleFolder as override if it exists
  const finalModuleFolder = moduleFolder || extractedModuleFolder;

  // Create a cache key that includes the module folder if present
  const cacheKey = finalModuleFolder
    ? `${moduleId}-${finalModuleFolder}`
    : moduleId;

  // Check if we have this module in cache and it's still valid
  if (repoCache[cacheKey] && repoCache[cacheKey].repo_link === repo_link) {
    const cachedDir = repoCache[cacheKey].path;

    // Check if directory still exists
    if (fs.existsSync(cachedDir)) {
      logger.info(
        `[Module Directory] Using cached module directory for module ${moduleId}: ${cachedDir}`
      );
      repoCache[cacheKey].lastAccessed = new Date();
      return cachedDir;
    }
    logger.warn(
      `[Module Directory] Cached directory no longer exists, will create new: ${cachedDir}`
    );
  }

  // Check if there's already an ongoing preparation for this module
  if (
    cacheKey in moduleDirLocks &&
    moduleDirLocks[cacheKey].constructor.name === "Promise"
  ) {
    logger.info(
      `[Module Directory] Waiting for existing preparation of module ${moduleId} to complete`
    );
    try {
      // Wait for the existing preparation to complete and return its result
      return await moduleDirLocks[cacheKey];
    } catch (error) {
      logger.error(
        `[Module Directory] Error waiting for existing preparation: ${error}`
      );
      return null;
    }
  }

  // Create a new lock for this module
  moduleDirLocks[cacheKey] = (async () => {
    // Double-check cache in case it was created while we were waiting
    if (repoCache[cacheKey] && repoCache[cacheKey].repo_link === repo_link) {
      const cachedDir = repoCache[cacheKey].path;
      if (fs.existsSync(cachedDir)) {
        logger.info(
          `[Module Directory] Using cached module directory for module ${moduleId}: ${cachedDir}`
        );
        repoCache[cacheKey].lastAccessed = new Date();
        return cachedDir;
      }
    }

    // Create a new directory for this module
    const tempDir = path.join(
      MODULE_BASE_DIR,
      `module-${moduleId}-${Date.now()}`
    );
    logger.debug(
      `[Module Directory] Creating new temporary directory: ${tempDir}`
    );

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Check if we need to clone a specific branch
    let branchName: string | null = null;

    // Extract branch from GitHub URL if it matches the tree pattern
    const githubTreeMatch = repo_link.match(
      /^(https:\/\/github\.com\/[^\/]+\/[^\/]+)\/tree\/([^\/]+)\/(.+)$/
    );

    if (githubTreeMatch) {
      branchName = githubTreeMatch[2];
      logger.debug(
        `[Module Directory] Will clone specific branch: ${branchName}`
      );
    }

    // Clone the repository
    logger.info(
      `[Module Directory] Cloning repository from ${baseRepoUrl}${
        branchName ? ` (branch: ${branchName})` : ""
      } to ${tempDir}`
    );

    try {
      // Use --branch flag if a specific branch is specified
      if (branchName) {
        await execPromise(
          `git clone --branch ${branchName} ${baseRepoUrl} ${tempDir}`
        );
      } else {
        await execPromise(`git clone ${baseRepoUrl} ${tempDir}`);
      }

      logger.debug(`[Module Directory] Repository cloned successfully`);

      // Install dependencies
      logger.info(
        `[Module Directory] Installing dependencies for module ${moduleId}`
      );
      try {
        await execPromise(`cd ${tempDir} && npm install`);
        logger.info(
          `[Module Directory] Successfully installed dependencies for module ${moduleId}`
        );
      } catch (npmError) {
        logger.warn(
          `[Module Directory] Error installing dependencies: ${npmError}. Continuing anyway.`
        );
        // We continue even if npm install fails, as the module might not need dependencies
      }

      // If moduleFolder is specified, create the final directory and copy only that folder
      let moduleDir = tempDir;

      if (finalModuleFolder) {
        const sourcePath = path.join(tempDir, finalModuleFolder);

        // Check if the specified folder exists in the repo
        if (!fs.existsSync(sourcePath)) {
          logger.error(`Module folder '${sourcePath}' not found in repository`);
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
        logger.info(
          `Copying module folder '${finalModuleFolder}' to ${moduleDir}`
        );

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
        repo_link: repo_link,
      };
      logger.debug(
        `[Module Directory] Module directory added to cache with key: ${cacheKey}`
      );

      return moduleDir;
    } catch (error) {
      logger.error(
        `[Module Directory] Error preparing module directory: ${error}`
      );
      logger.debug(
        `[Module Directory] Stack trace: ${
          error instanceof Error ? error.stack : "No stack trace available"
        }`
      );

      // Clean up on error
      if (fs.existsSync(tempDir)) {
        logger.debug(
          `[Module Directory] Cleaning up temporary directory after error: ${tempDir}`
        );
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      return null;
    }
  })();

  try {
    // Execute and return the result of the preparation
    return await moduleDirLocks[cacheKey];
  } finally {
    // Clean up the lock after completing (success or failure)
    delete moduleDirLocks[cacheKey];
    logger.debug(`[Module Directory] Released lock for module ${cacheKey}`);
  }
};

/**
 * Find the module.ts file in the module directory
 */
export const findModuleFile = async (
  dir: string
): Promise<{ moduleTs?: string; moduleJson?: string; widgetTs?: string }> => {
  logger.debug(`[Module File] Searching for module files in directory: ${dir}`);
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
        logger.debug(`[Module File] Searching subdirectory: ${fullPath}`);
        const subDirResults = await findModuleFile(fullPath);
        if (subDirResults.moduleTs) result.moduleTs = subDirResults.moduleTs;
        if (subDirResults.moduleJson)
          result.moduleJson = subDirResults.moduleJson;
        if (subDirResults.widgetTs) result.widgetTs = subDirResults.widgetTs;
      } else if (file.name.toLowerCase() === "module.ts") {
        logger.debug(`[Module File] Found module.ts: ${fullPath}`);
        result.moduleTs = fullPath;
      } else if (file.name.toLowerCase() === "module.json") {
        logger.debug(`[Module File] Found module.json: ${fullPath}`);
        result.moduleJson = fullPath;
      } else if (file.name.toLowerCase() === "widget.tsx") {
        logger.debug(`[Module File] Found widget.tsx: ${fullPath}`);
        result.widgetTs = fullPath;
      }
    }

    logger.info(
      `[Module File] Search results: moduleTs: ${
        result.moduleTs ? "found" : "not found"
      }, moduleJson: ${result.moduleJson ? "found" : "not found"}, widgetTs: ${
        result.widgetTs ? "found" : "not found"
      }`
    );
    return result;
  } catch (error) {
    logger.error(`[Module File] Error finding module files: ${error}`);
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
