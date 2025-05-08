import { Request, Response } from "express";
import logger from "../utils/logger";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import * as util from "util";
import { MODULE_BASE_DIR } from "../utils/constants";
import axios from "axios";
import { ModuleResultRepository } from "../dal/ModuleResultRepository";
import { findModuleFile } from "../middleware/moduleMiddleware";

const execPromise = util.promisify(exec);

interface RepoCache {
  [moduleId: string]: {
    path: string;
    lastAccessed: Date;
    repoLink: string;
  };
}

interface ModuleResult {
  timestamp: string;
  data: any;
}

interface SiteResults {
  [siteId: string]: ModuleResult[];
}

export class ModuleController {
  private moduleServiceUrl: string;
  private repoCache: RepoCache;
  private moduleRepository: ModuleRepository;
  private moduleResultRepository: ModuleResultRepository;

  constructor(
    moduleRepository: ModuleRepository,
    moduleResultRepository?: ModuleResultRepository
  ) {
    this.moduleServiceUrl =
      process.env.MODULE_SERVICE_URL || "http://module-service:5008";
    this.repoCache = {};
    this.moduleRepository = moduleRepository;
    this.moduleResultRepository =
      moduleResultRepository || new ModuleResultRepository();
    this.initialize();
  }

  initialize(): void {
    if (!fs.existsSync(MODULE_BASE_DIR)) {
      fs.mkdirSync(MODULE_BASE_DIR, { recursive: true });
    }
  }

  getRepoCache(): RepoCache {
    return this.repoCache;
  }

  async getAllModules(req: Request, res: Response): Promise<void> {
    try {
      const modules = await this.moduleRepository.getAllModules();
      res.status(200).json(modules);
    } catch (error) {
      logger.error("Error fetching all modules:", error);
      res.status(500).json({ message: "Error fetching modules", error });
    }
  }

  async getModuleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const module = await this.moduleRepository.getModuleById(id);

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      res.status(200).json(module);
    } catch (error) {
      logger.error(`Error fetching module by id ${req.params.id}:`, error);
      res.status(500).json({ message: "Error fetching module", error });
    }
  }

  async createModule(req: Request, res: Response): Promise<void> {
    // Implementation as needed for creation endpoints
  }

  async updateModule(req: Request, res: Response): Promise<void> {
    // Implementation as needed for update endpoints
  }

  async deleteModule(req: Request, res: Response): Promise<void> {
    // Implementation as needed for delete endpoints
  }

  // Get widget component from the module repository
  async getWidgetComponent(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const moduleDir = req.moduleDir;

      if (!moduleDir) {
        logger.error(`Module directory not found for module ${moduleId}`);
        return res
          .status(500)
          .json({ message: "Module directory not available" });
      }

      // Find the widget.tsx file
      const moduleFiles = await findModuleFile(moduleDir);

      if (!moduleFiles.widgetTs) {
        logger.error(
          `Widget.tsx file not found in repository for module ${moduleId}`
        );
        return res
          .status(404)
          .json({ message: "Widget component not found in repository" });
      }

      // Read the widget.tsx file
      const widgetContent = fs.readFileSync(moduleFiles.widgetTs, "utf8");

      logger.info(`Widget component found and read for module ${moduleId}`);

      // Return just the widget component content
      res.status(200).json({
        component: widgetContent,
      });
    } catch (error) {
      logger.error("Error fetching widget component:", error);
      res.status(500).json({
        message: "Error fetching widget component",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Get saved data for a module
  async getModuleData(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId, siteId } = req.params;

      if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
      }

      // Fetch the latest module data from the database
      let moduleData = null;

      if (siteId) {
        // If siteId is provided, get site-specific data
        moduleData = await this.moduleResultRepository.getLatestModuleResult(
          parseInt(siteId),
          parseInt(moduleId)
        );
      } else {
        // Without siteId, get the latest data for this module across all sites
        moduleData =
          await this.moduleResultRepository.getLatestModuleResultByModuleId(
            parseInt(moduleId)
          );
      }

      if (!moduleData) {
        logger.info(
          `No data found for module ${moduleId} ${
            siteId ? `and site ${siteId}` : ""
          }`
        );
        return res.status(200).json({ inputs: {} }); // Return empty inputs
      }

      logger.info(`Module data found for module ${moduleId}`);

      // Return the module data
      res.status(200).json({
        inputs: moduleData.resultData || {},
      });
    } catch (error) {
      logger.error("Error fetching module data:", error);
      res.status(500).json({
        message: "Error fetching module data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async collectData(req: Request, res: Response): Promise<void> {
    const { moduleId } = req.params;
    const { siteId, ...customInputs } = req.body;
    const moduleDir = req.moduleDir;

    logger.info(`Collecting data for module ${moduleId} with siteId ${siteId}`);

    try {
      if (!moduleDir) {
        logger.error(`Module directory not found for module ${moduleId}`);
        return res
          .status(500)
          .json({ message: "Module directory not available" });
      }

      const inputs = await this.prepareModuleInputs(
        siteId,
        req.moduleInfo,
        customInputs
      );

      // Find the module.ts file
      const moduleFiles = await findModuleFile(moduleDir);

      if (!moduleFiles.moduleTs) {
        logger.error(
          `Module.ts file not found in repository for module ${moduleId}`
        );
        return res
          .status(404)
          .json({ message: "Module.ts file not found in repository" });
      }

      // Execute the module.ts file
      try {
        logger.info(`Compiling TypeScript file: ${moduleFiles.moduleTs}`);
        await execPromise(
          `cd ${moduleDir} && npx tsc ${moduleFiles.moduleTs} --esModuleInterop --skipLibCheck`
        );

        const inputFilePath = path.join(moduleDir, "input.json");
        fs.writeFileSync(inputFilePath, JSON.stringify(inputs, null, 2));

        const jsFile = moduleFiles.moduleTs.replace(".ts", ".js");
        logger.info(
          `Executing module: ${jsFile} with inputs from ${inputFilePath}`
        );

        const { stdout, stderr } = await execPromise(
          `cd ${moduleDir} && node ${jsFile} ${inputFilePath}`
        );

        if (stderr) {
          logger.warn(`Module execution produced warnings/errors: ${stderr}`);
        }

        let result;
        try {
          result = JSON.parse(stdout);
        } catch (error) {
          logger.warn(
            `Could not parse module output as JSON, returning raw output`
          );
          result = { output: stdout };
        }

        // Update last accessed time for this cached module
        if (this.repoCache[moduleId]) {
          this.repoCache[moduleId].lastAccessed = new Date();
        }

        // Save result to database
        await this.saveResult(siteId, moduleId, result);

        logger.info(`Module execution completed successfully`);
        res.status(200).json(result);
      } catch (error) {
        logger.error(`Error executing module: ${error}`);
        res.status(500).json({
          message: "Error executing module",
          error: error.message,
          details: error.stderr || error.stdout,
        });
      }
    } catch (error) {
      logger.error("Error collecting data from module:", error);
      res
        .status(500)
        .json({ message: "Error collecting data from module", error });
    }
  }

  // Save the module execution result to database only
  async saveResult(siteId: string, moduleId: string, data: any): Promise<void> {
    if (!siteId) {
      logger.warn("No siteId provided, skipping result saving");
      return;
    }

    const timestamp = new Date();

    // Save to database
    try {
      await this.moduleResultRepository.saveModuleResult({
        siteId: parseInt(siteId),
        moduleId: parseInt(moduleId),
        timestamp: timestamp,
        resultData: data,
      });
      logger.info(
        `Result saved to database for site ${siteId} at ${timestamp.toISOString()}`
      );
    } catch (error) {
      logger.error(`Error saving result to database: ${error}`);
    }
  }

  // Gets or creates a module directory, using the cache when possible
  async getModuleDirectory(
    moduleId: string,
    repoLink: string,
    moduleFolder?: string
  ): Promise<string | null> {
    // If no repo link provided, we can't proceed
    if (!repoLink) {
      logger.warn(`No repository link provided for module ${moduleId}`);
      return null;
    }

    // Create a cache key that includes the module folder if present
    const cacheKey = moduleFolder ? `${moduleId}-${moduleFolder}` : moduleId;

    // Check if we have this module in cache and it's still valid
    if (
      this.repoCache[cacheKey] &&
      this.repoCache[cacheKey].repoLink === repoLink
    ) {
      const cachedDir = this.repoCache[cacheKey].path;

      // Check if directory still exists
      if (fs.existsSync(cachedDir)) {
        logger.info(`Using cached module directory for module ${moduleId}`);
        this.repoCache[cacheKey].lastAccessed = new Date();
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
        
        logger.info(`Successfully copied module folder and cleaned up temp directory`);
      }

      // Add to cache
      this.repoCache[cacheKey] = {
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
  }

  // Prepare combined inputs for module execution by gathering site info, plugin data, and module inputs
  async prepareModuleInputs(
    siteId: string,
    module: any,
    customInputs: any
  ): Promise<any> {
    // Start with module's own defined inputs if available
    const inputs = {
      ...(module.inputs || {}),
      ...customInputs,
    };

    if (!siteId) {
      logger.info(
        `No site ID provided, using only module inputs and custom inputs`
      );
      return inputs;
    }

    try {
      // Fetch site information
      const siteResponse = await axios.get(
        `${
          process.env.SITE_SERVICE_URL || "http://site-service:5004"
        }/${siteId}`
      );
      const siteInfo = siteResponse.data;

      if (siteInfo) {
        inputs.site = {
          id: siteInfo.id,
          domain: siteInfo.domain,
          name: siteInfo.name,
          description: siteInfo.description,
        };
      }

      // Fetch plugins for the site
      try {
        const pluginsResponse = await axios.get(
          `${
            process.env.PLUGIN_SERVICE_URL || "http://plugin-service:5005"
          }/site/${siteId}`
        );

        if (pluginsResponse.data && Array.isArray(pluginsResponse.data)) {
          const plugins = {};
          const pluginOutputs = {};

          // Process plugin data and extract plugin outputs
          pluginsResponse.data.forEach((plugin) => {
            // Add plugin info to the plugins collection
            plugins[plugin.name] = {
              id: plugin.id,
              name: plugin.name,
              requirements: plugin.requirements,
              fqdn: plugin.fqdn || null,
            };

            // If plugin has outputs, add them to the dedicated outputs collection
            if (plugin.outputs) {
              pluginOutputs[plugin.name] = plugin.outputs;
            }
          });

          // Add plugins to inputs if we found any
          if (Object.keys(plugins).length > 0) {
            inputs.plugins = plugins;
          }

          // Add plugin outputs to inputs if we found any
          if (Object.keys(pluginOutputs).length > 0) {
            inputs.pluginOutputs = pluginOutputs;
          }
        }
      } catch (pluginError) {
        logger.warn(
          `Failed to fetch plugin data for site ${siteId}: ${pluginError.message}`
        );
        // Continue execution even if plugin data fetch fails
      }
    } catch (siteError) {
      logger.warn(
        `Failed to fetch site information for site ${siteId}: ${siteError.message}`
      );
      // Continue execution with whatever inputs we have
    }

    logger.debug(`Prepared combined inputs for module execution:`, inputs);
    return inputs;
  }

  async findModuleFile(
    dir: string
  ): Promise<{ moduleTs?: string; moduleJson?: string }> {
    try {
      // Look for module.ts or similar file
      const files = await fs.promises.readdir(dir, { withFileTypes: true });

      const result: { moduleTs?: string; moduleJson?: string } = {};

      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          // Recursive search in subdirectories
          const subDirResults = await this.findModuleFile(fullPath);
          if (subDirResults.moduleTs) result.moduleTs = subDirResults.moduleTs;
          if (subDirResults.moduleJson)
            result.moduleJson = subDirResults.moduleJson;
        } else if (file.name.toLowerCase() === "module.ts") {
          result.moduleTs = fullPath;
        } else if (file.name.toLowerCase() === "module.json") {
          result.moduleJson = fullPath;
        }
      }

      return result;
    } catch (error) {
      logger.error(`Error finding module files: ${error}`);
      return {};
    }
  }
}

// Create singleton instance with dependencies
const moduleRepository = new ModuleRepository();
const moduleResultRepository = new ModuleResultRepository();
const moduleController = new ModuleController(
  moduleRepository,
  moduleResultRepository
);

// Export the singleton controller instance
export default moduleController;
