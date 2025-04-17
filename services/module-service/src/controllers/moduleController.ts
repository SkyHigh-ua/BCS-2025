import { Request, Response } from "express";
import { ModuleRepository } from "../dal/ModuleRepository";
import logger from "../utils/logger";

export class ModuleController {
  private moduleRepository: ModuleRepository;

  constructor(moduleRepository: ModuleRepository = new ModuleRepository()) {
    this.moduleRepository = moduleRepository;
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
    const { name, description, scriptFile, inputs, outputs } = req.body;
    try {
      const module = await this.moduleRepository.createModule({
        name,
        description,
        scriptFile,
        inputs,
        outputs,
        createdAt: new Date(),
        updatedAt: new Date(),
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
}
