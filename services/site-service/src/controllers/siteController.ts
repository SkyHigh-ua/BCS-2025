import { Request, Response } from "express";
import { SiteRepository } from "../dal/SiteRepository";
import logger from "../utils/logger";

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
    const { url, sshDetails } = req.body;
    try {
      const site = await this.siteRepository.createSite({
        url,
        sshDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
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
}
