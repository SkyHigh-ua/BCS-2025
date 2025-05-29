import * as fs from "fs";
import * as path from "path";
import logger from "./logger";
import { MODULE_BASE_DIR } from "./constants";
import { getRepoCache } from "../middleware/moduleMiddleware";

export class ModuleCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private moduleCacheRefGetter: (() => Record<string, any>) | null = null;

  /**
   * Set a function that will provide access to the module controller's cache
   * This allows the cleanup service to respect cached repositories
   */
  public setCacheReferenceGetter(getter: () => Record<string, any>): void {
    this.moduleCacheRefGetter = getter;
    logger.info("Cache reference getter has been set for cleanup service");
  }

  public startCleanupScheduler(intervalMs: number = 86400000): void {
    // Default: Run cleanup once a day (86400000 ms = 24 hours)
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldModules();
    }, intervalMs);

    // Initial cleanup when starting the scheduler
    this.cleanupOldModules();

    logger.info(
      `Scheduled automatic cleanup of old module directories every ${
        intervalMs / (60 * 60 * 1000)
      } hours`
    );
  }

  public stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info("Stopped automatic cleanup scheduler");
    }
  }

  public async cleanupOldModules(): Promise<void> {
    logger.info("Running scheduled cleanup of old module directories");

    try {
      if (!fs.existsSync(MODULE_BASE_DIR)) {
        return;
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const entries = fs.readdirSync(MODULE_BASE_DIR, { withFileTypes: true });

      // Get the current module cache - if the getter is not set, try to use the exported
      // getRepoCache function from moduleMiddleware
      let moduleCache = null;
      if (this.moduleCacheRefGetter) {
        moduleCache = this.moduleCacheRefGetter();
      } else {
        try {
          moduleCache = getRepoCache();
        } catch (error) {
          logger.warn(
            "Could not access repo cache from middleware, proceeding without cache information"
          );
        }
      }

      const cachedPaths = moduleCache
        ? Object.values(moduleCache).map((item) => item.path)
        : [];

      let removedCount = 0;

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const dirPath = path.join(MODULE_BASE_DIR, entry.name);

        // Skip any directory that's in the active cache
        if (cachedPaths.includes(dirPath)) {
          logger.debug(
            `Skipping cleanup of actively cached directory: ${dirPath}`
          );
          continue;
        }

        try {
          const stats = fs.statSync(dirPath);
          const lastAccessTime = new Date(stats.atime);

          if (lastAccessTime < oneWeekAgo) {
            this.cleanupModuleDir(dirPath);
            removedCount++;
          }
        } catch (error) {
          logger.error(`Error checking directory ${dirPath}: ${error}`);
        }
      }

      logger.info(
        `Cleanup completed: removed ${removedCount} old module directories`
      );
    } catch (error) {
      logger.error(`Error during scheduled cleanup: ${error}`);
    }
  }

  public cleanupModuleDir(dir: string): void {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        logger.debug(`Cleaned up temporary module directory: ${dir}`);
      }
    } catch (error) {
      logger.warn(`Failed to clean up directory ${dir}: ${error}`);
    }
  }
}

let cleanupService: ModuleCleanupService | null = null;

export function initializeCleanupService(): ModuleCleanupService {
  if (!cleanupService) {
    cleanupService = new ModuleCleanupService();
  }
  return cleanupService;
}

export function getCleanupService(): ModuleCleanupService | null {
  return cleanupService;
}
