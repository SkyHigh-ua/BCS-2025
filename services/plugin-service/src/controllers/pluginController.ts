import { Request, Response } from "express";
import { PluginRepository } from "../dal/PluginRepository";
import logger from "../utils/logger";

export class PluginController {
  private pluginRepository: PluginRepository;

  constructor(pluginRepository: PluginRepository = new PluginRepository()) {
    this.pluginRepository = pluginRepository;
  }

  async getAllPlugins(req: Request, res: Response) {
    try {
      const plugins = await this.pluginRepository.getAllPlugins();
      logger.info(`[${req.method}] ${req.url} - 200: Fetched all plugins`);
      res.status(200).json(plugins);
    } catch (error) {
      logger.error("Error fetching plugins:", error);
      res.status(500).json({ message: "Error fetching plugins", error });
    }
  }

  async getPluginById(req: Request, res: Response) {
    try {
      const plugin = await this.pluginRepository.getPluginById(req.params.id);
      if (plugin) {
        logger.info(`[${req.method}] ${req.url} - 200: Plugin found`);
        res.status(200).json(plugin);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Plugin not found`);
        res.status(404).json({ message: "Plugin not found" });
      }
    } catch (error) {
      logger.error("Error fetching plugin:", error);
      res.status(500).json({ message: "Error fetching plugin", error });
    }
  }

  async createPlugin(req: Request, res: Response) {
    const { type } = req.body;
    try {
      const plugin = await this.pluginRepository.createPlugin({
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info(`[${req.method}] ${req.url} - 201: Plugin created`);
      res.status(201).json(plugin);
    } catch (error) {
      logger.error("Error creating plugin:", error);
      res.status(500).json({ message: "Error creating plugin", error });
    }
  }

  async updatePlugin(req: Request, res: Response) {
    try {
      const plugin = await this.pluginRepository.updatePlugin(
        req.params.id,
        req.body
      );
      if (plugin) {
        logger.info(`[${req.method}] ${req.url} - 200: Plugin updated`);
        res.status(200).json(plugin);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Plugin not found`);
        res.status(404).json({ message: "Plugin not found" });
      }
    } catch (error) {
      logger.error("Error updating plugin:", error);
      res.status(500).json({ message: "Error updating plugin", error });
    }
  }

  async deletePlugin(req: Request, res: Response) {
    try {
      await this.pluginRepository.deletePlugin(req.params.id);
      logger.info(`[${req.method}] ${req.url} - 204: Plugin deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting plugin:", error);
      res.status(500).json({ message: "Error deleting plugin", error });
    }
  }
}
