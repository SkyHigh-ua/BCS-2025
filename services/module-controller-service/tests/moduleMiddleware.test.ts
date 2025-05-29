import {
  ensureModuleRepo,
  getModuleDirectory,
  findModuleFile,
} from "../src/middleware/moduleMiddleware";
import fs from "fs";
import path from "path";
import * as util from "util";
import { exec } from "child_process";
import logger from "../src/utils/logger";
import { MODULE_BASE_DIR } from "../src/utils/constants";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  rmSync: jest.fn(),
  promises: {
    readdir: jest.fn(),
  },
}));
jest.mock("path");
jest.mock("util", () => ({
  promisify: jest.fn(),
}));
jest.mock("child_process", () => ({
  exec: jest.fn(),
}));
jest.mock("../src/utils/logger");
jest.mock("../src/utils/constants", () => ({
  MODULE_BASE_DIR: "/mock/module/dir",
}));
jest.mock("../src/utils/authUtils", () => ({
  getAuthHeader: jest.fn(),
}));

describe("Module Middleware", () => {
  const mockExecPromise = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup promisify mock - fixed type casting
    (util.promisify as unknown as jest.Mock).mockReturnValue(mockExecPromise);

    // Reset fs mocks
    (fs.existsSync as jest.Mock).mockReset().mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockReset();
    (fs.rmSync as jest.Mock).mockReset();
    (fs.promises.readdir as jest.Mock).mockReset();

    // Path mock
    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
  });

  describe("ensureModuleRepo", () => {
    it("should proceed if module repository is available", async () => {
      const req = {
        params: { moduleId: "1" },
        moduleInfo: {
          repo_link: "https://github.com/user/repo",
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      // Mock getModuleDirectory to succeed
      const mockGetModuleDirectory = jest
        .spyOn(
          require("../src/middleware/moduleMiddleware"),
          "getModuleDirectory"
        )
        .mockResolvedValueOnce("/path/to/module");

      await ensureModuleRepo(req, res, next);

      expect(req.moduleDir).toBe("/path/to/module");
      expect(mockGetModuleDirectory).toHaveBeenCalledWith(
        "1",
        "https://github.com/user/repo",
        undefined
      );
      expect(next).toHaveBeenCalled();
    });

    it("should return 404 if module info is missing", async () => {
      const req = {
        params: { moduleId: "1" },
        moduleInfo: null,
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await ensureModuleRepo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Module not found" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if repo link is missing", async () => {
      const req = {
        params: { moduleId: "1" },
        moduleInfo: { repo_link: null },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await ensureModuleRepo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Module has no repository link",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 if module directory preparation fails", async () => {
      const req = {
        params: { moduleId: "1" },
        moduleInfo: {
          repo_link: "https://github.com/user/repo",
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      // Mock getModuleDirectory to fail
      jest
        .spyOn(
          require("../src/middleware/moduleMiddleware"),
          "getModuleDirectory"
        )
        .mockResolvedValueOnce(null);

      await ensureModuleRepo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to prepare module directory",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle errors during execution", async () => {
      const req = {
        params: { moduleId: "1" },
        moduleInfo: {
          repo_link: "https://github.com/user/repo",
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      // Mock getModuleDirectory to throw
      jest
        .spyOn(
          require("../src/middleware/moduleMiddleware"),
          "getModuleDirectory"
        )
        .mockRejectedValueOnce(new Error("Test error"));

      await ensureModuleRepo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to prepare module repository",
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("findModuleFile", () => {
    it("should find module files in the root directory", async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { name: "module.ts", isDirectory: () => false },
        { name: "module.json", isDirectory: () => false },
        { name: "widget.tsx", isDirectory: () => false },
      ]);

      const result = await findModuleFile("/test/dir");

      expect(result).toEqual({
        moduleTs: "/test/dir/module.ts",
        moduleJson: "/test/dir/module.json",
        widgetTs: "/test/dir/widget.tsx",
      });
    });

    it("should find module files in subdirectories", async () => {
      (fs.promises.readdir as jest.Mock).mockImplementation((dir) => {
        if (dir === "/test/dir") {
          return [
            { name: "subdir", isDirectory: () => true },
            { name: "another.ts", isDirectory: () => false },
          ];
        } else if (dir === "/test/dir/subdir") {
          return [
            { name: "module.ts", isDirectory: () => false },
            { name: "widget.tsx", isDirectory: () => false },
          ];
        }
        return [];
      });

      const result = await findModuleFile("/test/dir");

      expect(result).toEqual({
        moduleTs: "/test/dir/subdir/module.ts",
        widgetTs: "/test/dir/subdir/widget.tsx",
      });
    });

    it("should return empty object if no files found", async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { name: "other.ts", isDirectory: () => false },
      ]);

      const result = await findModuleFile("/test/dir");

      expect(result).toEqual({});
    });

    it("should handle errors", async () => {
      (fs.promises.readdir as jest.Mock).mockRejectedValue(
        new Error("Read dir error")
      );

      const result = await findModuleFile("/test/dir");

      expect(result).toEqual({});
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error finding module files")
      );
    });
  });
});
