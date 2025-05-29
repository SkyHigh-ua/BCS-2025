import { ModuleCleanupService } from "../src/utils/moduleCleanup";
import fs from "fs";
import path from "path";
import logger from "../src/utils/logger";
import { MODULE_BASE_DIR } from "../src/utils/constants";

jest.mock("fs");
jest.mock("path");
jest.mock("../src/utils/logger");
jest.mock("../src/utils/constants", () => ({
  MODULE_BASE_DIR: "/mock/module/dir",
}));
jest.mock("../src/middleware/moduleMiddleware", () => ({
  getRepoCache: jest.fn(() => ({})),
}));

describe("ModuleCleanupService", () => {
  let cleanupService: ModuleCleanupService;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupService = new ModuleCleanupService();

    // Reset mocks
    (fs.existsSync as jest.Mock).mockReset();
    (fs.readdirSync as jest.Mock).mockReset();
    (fs.statSync as jest.Mock).mockReset();
    (fs.rmSync as jest.Mock).mockReset();
  });

  afterEach(() => {
    // Access private property safely using type assertion
    const privateService = cleanupService as any;
    if (privateService.cleanupInterval) {
      cleanupService.stopCleanupScheduler();
    }
  });

  describe("setCacheReferenceGetter", () => {
    it("should set the cache reference getter function", () => {
      const mockGetter = jest.fn(() => ({ key: "value" }));
      cleanupService.setCacheReferenceGetter(mockGetter);

      // Access the private property via type casting for testing
      const privateProps = cleanupService as any;
      expect(privateProps.moduleCacheRefGetter).toBe(mockGetter);
      expect(logger.info).toHaveBeenCalledWith(
        "Cache reference getter has been set for cleanup service"
      );
    });
  });

  describe("startCleanupScheduler", () => {
    it("should start the cleanup scheduler with default interval", () => {
      jest.spyOn(global, "setInterval").mockReturnValue({} as NodeJS.Timeout);
      jest.spyOn(cleanupService, "cleanupOldModules").mockResolvedValue();

      cleanupService.startCleanupScheduler();

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        86400000 // Default value
      );
      expect(cleanupService.cleanupOldModules).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Scheduled automatic cleanup")
      );
    });

    it("should start the cleanup scheduler with custom interval", () => {
      jest.spyOn(global, "setInterval").mockReturnValue({} as NodeJS.Timeout);
      jest.spyOn(cleanupService, "cleanupOldModules").mockResolvedValue();

      const customInterval = 3600000; // 1 hour
      cleanupService.startCleanupScheduler(customInterval);

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        customInterval
      );
    });
  });

  describe("stopCleanupScheduler", () => {
    it("should stop the cleanup scheduler if running", () => {
      jest.spyOn(global, "clearInterval");

      // Setup interval
      jest.spyOn(global, "setInterval").mockReturnValue({} as NodeJS.Timeout);
      cleanupService.startCleanupScheduler();

      cleanupService.stopCleanupScheduler();

      expect(clearInterval).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Stopped automatic cleanup scheduler"
      );
    });

    it("should do nothing if scheduler is not running", () => {
      jest.spyOn(global, "clearInterval");

      // Ensure no interval is set
      const privateProps = cleanupService as any;
      privateProps.cleanupInterval = null;

      cleanupService.stopCleanupScheduler();

      expect(clearInterval).not.toHaveBeenCalled();
    });
  });

  describe("cleanupOldModules", () => {
    it("should do nothing if base directory doesn't exist", async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await cleanupService.cleanupOldModules();

      expect(fs.readdirSync).not.toHaveBeenCalled();
    });

    it("should cleanup directories older than a week", async () => {
      // Setup mocks
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        { name: "old-dir", isDirectory: () => true },
        { name: "recent-dir", isDirectory: () => true },
        { name: "file.txt", isDirectory: () => false },
      ]);

      // Path join mock
      (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));

      // Mock stats for old directory
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
      (fs.statSync as jest.Mock).mockImplementation((path) => {
        if (path === "/mock/module/dir/old-dir") {
          return { atime: oldDate };
        } else {
          return { atime: new Date() }; // Recent
        }
      });

      // Set up the cache reference getter
      cleanupService.setCacheReferenceGetter(() => ({
        module1: { path: "/mock/module/dir/recent-dir" },
      }));

      jest.spyOn(cleanupService, "cleanupModuleDir");

      await cleanupService.cleanupOldModules();

      // Should clean up only old-dir
      expect(cleanupService.cleanupModuleDir).toHaveBeenCalledWith(
        "/mock/module/dir/old-dir"
      );
      expect(cleanupService.cleanupModuleDir).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("removed 1 old module")
      );
    });

    it("should skip directories in the active cache", async () => {
      // Setup mocks
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        { name: "cached-dir", isDirectory: () => true },
        { name: "old-dir", isDirectory: () => true },
      ]);

      // Path join mock
      (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));

      // All directories are old
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
      (fs.statSync as jest.Mock).mockReturnValue({ atime: oldDate });

      // Set up the cache reference getter to include cached-dir
      cleanupService.setCacheReferenceGetter(() => ({
        module1: { path: "/mock/module/dir/cached-dir" },
      }));

      jest.spyOn(cleanupService, "cleanupModuleDir");

      await cleanupService.cleanupOldModules();

      // Should clean up only old-dir, not cached-dir
      expect(cleanupService.cleanupModuleDir).toHaveBeenCalledWith(
        "/mock/module/dir/old-dir"
      );
      expect(cleanupService.cleanupModuleDir).not.toHaveBeenCalledWith(
        "/mock/module/dir/cached-dir"
      );
    });

    it("should handle errors during cleanup", async () => {
      // Setup mocks
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        { name: "error-dir", isDirectory: () => true },
      ]);

      // Path join mock
      (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));

      // Mock statSync to throw an error
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error("stat error");
      });

      await cleanupService.cleanupOldModules();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error checking directory")
      );
    });
  });

  describe("cleanupModuleDir", () => {
    it("should remove the directory if it exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      cleanupService.cleanupModuleDir("/path/to/dir");

      expect(fs.rmSync).toHaveBeenCalledWith("/path/to/dir", {
        recursive: true,
        force: true,
      });
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Cleaned up temporary module directory")
      );
    });

    it("should do nothing if directory doesn't exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      cleanupService.cleanupModuleDir("/path/to/dir");

      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("should handle errors when removing directory", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.rmSync as jest.Mock).mockImplementation(() => {
        throw new Error("remove error");
      });

      cleanupService.cleanupModuleDir("/path/to/dir");

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to clean up directory")
      );
    });
  });
});
