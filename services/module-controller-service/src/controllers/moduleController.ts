import { Request, Response } from "express";
import logger from "../utils/logger";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import * as util from "util";
import { MODULE_BASE_DIR } from "../utils/constants";
import axios from "axios";

const execPromise = util.promisify(exec);

interface RepoCache {
  [moduleId: string]: {
    path: string;
    lastAccessed: Date;
    repoLink: string;
  };
}

const moduleController = {
  moduleServiceUrl:
    process.env.MODULE_SERVICE_URL || "http://module-service:5008",
  repoCache: {} as RepoCache,

  initialize(): void {
    if (!fs.existsSync(MODULE_BASE_DIR)) {
      fs.mkdirSync(MODULE_BASE_DIR, { recursive: true });
    }
  },

  getRepoCache(): RepoCache {
    return this.repoCache;
  },

  async collectData(req: Request, res: Response): Promise<void> {
    const { moduleId } = req.params;
    const { siteId, ...customInputs } = req.body;

    logger.info(`Collecting data for module ${moduleId} with siteId ${siteId}`);

    try {
      const moduleResponse = await axios.get(
        `${this.moduleServiceUrl}/${moduleId}`
      );
      const module = moduleResponse.data;

      if (!module) {
        logger.warn(`Module ${moduleId} not found`);
        return res.status(404).json({ message: "Module not found" });
      }

      const inputs = await this.prepareModuleInputs(
        siteId,
        module,
        customInputs
      );

      const moduleDir = await this.getModuleDirectory(
        moduleId,
        module.repoLink
      );

      if (!moduleDir) {
        logger.error(
          `Failed to prepare module directory for module ${moduleId}`
        );
        return res
          .status(500)
          .json({ message: "Failed to prepare module directory" });
      }

      // Find the module.ts file
      const moduleFiles = await this.findModuleFile(moduleDir);

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
  },

  // Gets or creates a module directory, using the cache when possible
  async getModuleDirectory(
    moduleId: string,
    repoLink: string
  ): Promise<string | null> {
    // If no repo link provided, we can't proceed
    if (!repoLink) {
      logger.warn(`No repository link provided for module ${moduleId}`);
      return null;
    }

    // Check if we have this module in cache and it's still valid
    if (
      this.repoCache[moduleId] &&
      this.repoCache[moduleId].repoLink === repoLink
    ) {
      const cachedDir = this.repoCache[moduleId].path;

      // Check if directory still exists
      if (fs.existsSync(cachedDir)) {
        logger.info(`Using cached module directory for module ${moduleId}`);
        this.repoCache[moduleId].lastAccessed = new Date();
        return cachedDir;
      }
    }

    // Create a new directory for this module
    const moduleDir = path.join(
      MODULE_BASE_DIR,
      `module-${moduleId}-${Date.now()}`
    );
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // Clone the repository
    logger.info(`Cloning repository from ${repoLink}`);
    try {
      await execPromise(`git clone ${repoLink} ${moduleDir}`);

      // Add to cache
      this.repoCache[moduleId] = {
        path: moduleDir,
        lastAccessed: new Date(),
        repoLink: repoLink,
      };

      return moduleDir;
    } catch (error) {
      logger.error(`Error cloning repository: ${error}`);
      return null;
    }
  },

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
  },

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
  },
};

// Initialize the module controller
moduleController.initialize();

// Export the singleton controller instance
export default moduleController;
