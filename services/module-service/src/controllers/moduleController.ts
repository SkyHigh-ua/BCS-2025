import { Request, Response } from "express";
import { ModuleRepository } from "../dal/ModuleRepository";
import logger from "../utils/logger";
import axios from "axios";

export class ModuleController {
  private moduleRepository: ModuleRepository;
  private moduleControllerUrl: string;

  constructor(moduleRepository: ModuleRepository = new ModuleRepository()) {
    this.moduleRepository = moduleRepository;
    this.moduleControllerUrl =
      process.env.MODULE_CONTROLLER_URL ||
      "http://module-controller-service:5009";
  }

  async getAllModules(req: Request, res: Response) {
    try {
      const modules = await this.moduleRepository.getAllModules();
      logger.info(`[${req.method}] ${req.url} - 200: Fetched all modules`);
      res.status(200).json(modules);
    } catch (error) {
      logger.error("Error fetching modules:", error);
      res.status(500).json({ message: "Error fetching modules", error });
    }
  }

  async getModuleById(req: Request, res: Response) {
    try {
      const module = await this.moduleRepository.getModuleById(req.params.id);
      if (module) {
        logger.info(`[${req.method}] ${req.url} - 200: Module found`);
        res.status(200).json(module);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Module not found`);
        res.status(404).json({ message: "Module not found" });
      }
    } catch (error) {
      logger.error("Error fetching module:", error);
      res.status(500).json({ message: "Error fetching module", error });
    }
  }

  async createModule(req: Request, res: Response) {
    const { name, description, repoLink, inputs, outputs, tags } = req.body;
    try {
      const module = await this.moduleRepository.createModule({
        name,
        description,
        repoLink,
        inputs,
        outputs,
        tags,
      });
      logger.info(`[${req.method}] ${req.url} - 201: Module created`);
      res.status(201).json(module);
    } catch (error) {
      logger.error("Error creating module:", error);
      res.status(500).json({ message: "Error creating module", error });
    }
  }

  async updateModule(req: Request, res: Response) {
    try {
      const module = await this.moduleRepository.updateModule(
        req.params.id,
        req.body
      );
      if (module) {
        logger.info(`[${req.method}] ${req.url} - 200: Module updated`);
        res.status(200).json(module);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Module not found`);
        res.status(404).json({ message: "Module not found" });
      }
    } catch (error) {
      logger.error("Error updating module:", error);
      res.status(500).json({ message: "Error updating module", error });
    }
  }

  async deleteModule(req: Request, res: Response) {
    try {
      await this.moduleRepository.deleteModule(req.params.id);
      logger.info(`[${req.method}] ${req.url} - 204: Module deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting module:", error);
      res.status(500).json({ message: "Error deleting module", error });
    }
  }

  async getModulesBySiteId(req: Request, res: Response) {
    const { siteId } = req.params;
    try {
      const modules = await this.moduleRepository.getModulesBySiteId(
        Number(siteId)
      );
      if (modules.length > 0) {
        logger.info(
          `[${req.method}] ${req.url} - 200: Modules found for site ${siteId}`
        );
        res.status(200).json(modules);
      } else {
        logger.info(
          `[${req.method}] ${req.url} - 404: No modules found for site ${siteId}`
        );
        res.status(404).json({ message: "No modules found for this site" });
      }
    } catch (error) {
      logger.error(
        `[${req.method}] ${req.url} - 500: Error fetching modules for site`,
        error
      );
      res
        .status(500)
        .json({ message: "Error fetching modules for site", error });
    }
  }

  async assignModulesToSite(req: Request, res: Response) {
    const { siteId } = req.params;
    const { moduleIds, cronExpression } = req.body;

    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res
        .status(400)
        .json({ message: "moduleIds must be a non-empty array" });
    }

    try {
      await this.moduleRepository.assignModulesToSite(
        Number(siteId),
        moduleIds
      );

      for (const moduleId of moduleIds) {
        await axios.post(
          `${process.env.SCHEDULER_SERVICE_URL}/schedule`,
          {
            siteId,
            moduleId,
            cronExpression,
          },
          {
            headers: {
              Authorization: `Bearer ${
                req.headers.authorization?.split(" ")[1]
              }`,
            },
          }
        );
      }

      logger.info(
        `[${req.method}] ${req.url} - 201: Modules [${moduleIds.join(
          ", "
        )}] assigned to site ${siteId}`
      );
      res.status(201).json({
        message: `Modules [${moduleIds.join(", ")}] assigned to site ${siteId}`,
      });
    } catch (error) {
      logger.error(
        `[${req.method}] ${req.url} - 500: Error assigning modules to site`,
        error
      );
      res
        .status(500)
        .json({ message: "Error assigning modules to site", error });
    }
  }

  async removeModulesFromSite(req: Request, res: Response) {
    const { siteId } = req.params;
    const { moduleIds } = req.body;

    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res
        .status(400)
        .json({ message: "moduleIds must be a non-empty array" });
    }

    try {
      await this.moduleRepository.removeModulesFromSite(
        Number(siteId),
        moduleIds
      );

      try {
        for (const moduleId of moduleIds) {
          await axios.delete(`${process.env.SCHEDULER_SERVICE_URL}/schedule`, {
            data: { siteId, moduleId },
            headers: {
              Authorization: `Bearer ${
                req.headers.authorization?.split(" ")[1]
              }`,
            },
          });
        }
      } catch (schedulerError) {
        logger.warn(`Could not remove scheduled tasks: ${schedulerError}`);
      }

      logger.info(
        `[${req.method}] ${req.url} - 200: Modules [${moduleIds.join(
          ", "
        )}] removed from site ${siteId}`
      );
      res.status(200).json({
        message: `Modules [${moduleIds.join(
          ", "
        )}] removed from site ${siteId}`,
      });
    } catch (error) {
      logger.error(
        `[${req.method}] ${req.url} - 500: Error removing modules from site`,
        error
      );
      res
        .status(500)
        .json({ message: "Error removing modules from site", error });
    }
  }

  async getModulesByTags(req: Request, res: Response) {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({ message: "Tags are required" });
    }

    try {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const stringTags = tagArray.filter(
        (tag): tag is string => typeof tag === "string"
      );
      const modules = await this.moduleRepository.getModulesByTags(stringTags);
      logger.info(`[${req.method}] ${req.url} - 200: Modules fetched by tags`);
      res.status(200).json(modules);
    } catch (error) {
      logger.error("Error fetching modules by tags:", error);
      res
        .status(500)
        .json({ message: "Error fetching modules by tags", error });
    }
  }

  async getWidgetComponent(req: Request, res: Response) {
    try {
      const { moduleId } = req.params;

      let componentContent;
      try {
        const componentResponse = await axios.get(
          `${this.moduleControllerUrl}/widget/${moduleId}`,
          {
            headers: {
              Authorization: `Bearer ${
                req.headers.authorization?.split(" ")[1]
              }`,
            },
          }
        );
        componentContent = componentResponse.data.component;
      } catch (error) {
        logger.error(
          `Error fetching widget component from module controller: ${error}`
        );
        componentContent = null;
      }

      let componentData;
      try {
        const componentResponse = await axios.get(
          `${this.moduleControllerUrl}/data/${moduleId}`,
          {
            headers: {
              Authorization: `Bearer ${
                req.headers.authorization?.split(" ")[1]
              }`,
            },
          }
        );
        componentData = componentResponse.data.component;
      } catch (error) {
        logger.error(
          `Error fetching widget component from module controller: ${error}`
        );
        componentData = null;
      }

      logger.info(
        `[${req.method}] ${req.url} - 200: Widget component and data fetched`
      );

      res.status(200).json({
        module,
        component: componentContent,
        inputs: componentData,
      });
    } catch (error) {
      logger.error("Error fetching widget component:", error);
      res.status(500).json({
        message: "Error fetching widget component",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
