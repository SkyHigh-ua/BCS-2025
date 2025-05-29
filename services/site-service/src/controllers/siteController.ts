import { Request, Response } from "express";
import { SiteRepository } from "../dal/SiteRepository";
import logger from "../utils/logger";
import axios from "axios";

export class SiteController {
  private siteRepository: SiteRepository;

  constructor(siteRepository: SiteRepository = new SiteRepository()) {
    this.siteRepository = siteRepository;
  }

  async getAllSites(req: Request, res: Response) {
    try {
      const sites = await this.siteRepository.getAllSites();
      logger.info(`[${req.method}] ${req.url} - 200: Fetched all sites`);
      res.status(200).json(sites);
    } catch (error) {
      logger.error("Error fetching sites:", error);
      res.status(500).json({ message: "Error fetching sites", error });
    }
  }

  async getSiteById(req: Request, res: Response) {
    try {
      const site = await this.siteRepository.getSiteById(Number(req.params.id));
      if (site) {
        logger.info(`[${req.method}] ${req.url} - 200: Site found`);
        res.status(200).json(site);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Site not found`);
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error) {
      logger.error("Error fetching site:", error);
      res.status(500).json({ message: "Error fetching site", error });
    }
  }

  async createSite(req: Request, res: Response) {
    const { domain, name, description } = req.body;
    const author = req.user && "id" in req.user ? req.user.id : undefined;
    try {
      if (!author) {
        logger.info(`[${req.method}] ${req.url} - 400: Invalid user`);
        return res.status(400).json({ message: "Invalid user" });
      }
      const site = await this.siteRepository.createSite({
        domain,
        name,
        description,
        author,
      });
      logger.info(`[${req.method}] ${req.url} - 201: Site created`);
      res.status(201).json(site);
    } catch (error) {
      logger.error("Error creating site:", error);
      res.status(500).json({ message: "Error creating site", error });
    }
  }

  async updateSite(req: Request, res: Response) {
    try {
      const site = await this.siteRepository.updateSite(
        Number(req.params.id),
        req.body
      );
      if (site) {
        logger.info(`[${req.method}] ${req.url} - 200: Site updated`);
        res.status(200).json(site);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Site not found`);
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error) {
      logger.error("Error updating site:", error);
      res.status(500).json({ message: "Error updating site", error });
    }
  }

  async deleteSite(req: Request, res: Response) {
    try {
      await this.siteRepository.deleteSite(Number(req.params.id));
      logger.info(`[${req.method}] ${req.url} - 204: Site deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting site:", error);
      res.status(500).json({ message: "Error deleting site", error });
    }
  }

  async getUserSites(req: Request, res: Response) {
    try {
      const user = req.user;
      if (user && "id" in user) {
        const userId = user.id;
        const sites = await this.siteRepository.getUserSites(userId);
        logger.info(`[${req.method}] ${req.url} - 200: Fetched user sites`);
        res.status(200).json(sites);
      } else {
        logger.info(`[${req.method}] ${req.url} - 400: Invalid user type`);
        res.status(400).json({ message: "Invalid user type" });
      }
    } catch (error) {
      logger.error("Error fetching user sites:", error);
      res.status(500).json({ message: "Error fetching user sites", error });
    }
  }
}
