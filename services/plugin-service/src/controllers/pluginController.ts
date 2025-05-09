import { Request, Response } from "express";
import { PluginRepository } from "../dal/PluginRepository";
import logger from "../utils/logger";
import { loadPluginService } from "../services/pluginLoader";

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
    try {
      const { name, description, requirements, repoLink, tags } = req.body;

      const plugin = await this.pluginRepository.createPlugin({
        name,
        description,
        requirements,
        repoLink,
        tags,
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

  async loadPlugin(req: Request, res: Response) {
    const { id } = req.params;
    const { sshKey, otherParams } = req.body;

    try {
      await loadPluginService(id, sshKey, otherParams);
      logger.info(
        `[${req.method}] ${req.url} - 200: Plugin loaded successfully`
      );
      res.status(200).json({ message: "Plugin loaded successfully" });
    } catch (error) {
      logger.error("Error loading plugin:", error);
      res.status(500).json({ message: "Error loading plugin", error });
    }
  }

  async assignPluginToSite(req: Request, res: Response) {
    const { pluginId } = req.params;
    const { siteId } = req.body;

    try {
      const result = await this.pluginRepository.assignPluginToSite(
        pluginId,
        siteId
      );
      logger.info(`[${req.method}] ${req.url} - 200: Plugin assigned to site`);
      res
        .status(200)
        .json({ message: "Plugin assigned to site successfully", result });
    } catch (error) {
      logger.error("Error assigning plugin to site:", error);
      res
        .status(500)
        .json({ message: "Error assigning plugin to site", error });
    }
  }

  async findPluginsByTags(req: Request, res: Response) {
    const { tags } = req.query;

    if (!tags) {
      return res.status(400).json({ message: "Tags are required" });
    }

    const tagArray = Array.isArray(tags) ? tags : [tags];

    try {
      const plugins = await this.pluginRepository.findPluginsByTags(
        tagArray.map((tag) => String(tag))
      );
      logger.info(`[${req.method}] ${req.url} - 200: Plugins fetched by tags`);
      res.status(200).json(plugins);
    } catch (error) {
      logger.error("Error fetching plugins by tags:", error);
      res
        .status(500)
        .json({ message: "Error fetching plugins by tags", error });
    }
  }

  async getSitePlugins(req: Request, res: Response) {
    const { siteId } = req.params;
    try {
      const plugins = await this.pluginRepository.getSitePlugins(siteId);
      logger.info(
        `[${req.method}] ${req.url} - 200: Plugins fetched for site ${siteId}`
      );
      res.status(200).json(plugins);
    } catch (error) {
      logger.error("Error fetching site plugins:", error);
      res.status(500).json({ message: "Error fetching site plugins", error });
    }
  }

  async updatePluginFqdnAndOutputs(req: Request, res: Response) {
    const { pluginId } = req.params;
    const { fqdn, outputs } = req.body;

    if (!fqdn && !outputs) {
      logger.warn(`[${req.method}] ${req.url} - 400: Missing fqdn or outputs`);
      return res
        .status(400)
        .json({ message: "Either fqdn or outputs must be provided" });
    }

    try {
      const updateData: { fqdn?: string; outputs?: any } = {};
      if (fqdn) updateData.fqdn = fqdn;
      if (outputs) updateData.outputs = outputs;

      const plugin = await this.pluginRepository.updatePlugin(
        pluginId,
        updateData
      );

      if (plugin) {
        logger.info(
          `[${req.method}] ${req.url} - 200: Plugin FQDN and outputs updated`
        );
        res.status(200).json(plugin);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Plugin not found`);
        res.status(404).json({ message: "Plugin not found" });
      }
    } catch (error) {
      logger.error("Error updating plugin FQDN and outputs:", error);
      res
        .status(500)
        .json({ message: "Error updating plugin FQDN and outputs", error });
    }
  }
}
