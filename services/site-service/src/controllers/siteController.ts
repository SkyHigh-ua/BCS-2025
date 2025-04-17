import { Request, Response } from "express";
import { SiteRepository } from "../dal/SiteRepository";
import logger from "../utils/logger";

export class SiteController {
  private siteRepository: SiteRepository;

  constructor(siteRepository: SiteRepository = new SiteRepository()) {
    this.siteRepository = siteRepository;
  }

  async getAllSites(req: Request, res: Response) {
    logger.debug("Fetching all sites");
    try {
      const sites = await this.siteRepository.getAllSites();
      logger.info("Fetched all sites successfully");
      res.status(200).json(sites);
    } catch (error) {
      logger.error("Error fetching sites:", error);
      res.status(500).json({ message: "Error fetching sites", error });
    }
  }

  async getSiteById(req: Request, res: Response) {
    logger.debug(`Fetching site by ID: ${req.params.id}`);
    try {
      const site = await this.siteRepository.getSiteById(Number(req.params.id));
      if (site) {
        logger.info(`Site with ID ${req.params.id} fetched successfully`);
        res.status(200).json(site);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error) {
      logger.error("Error fetching site:", error);
      res.status(500).json({ message: "Error fetching site", error });
    }
  }

  async createSite(req: Request, res: Response) {
    logger.debug("Creating a new site");
    const { url, sshDetails } = req.body;
    try {
      const site = await this.siteRepository.createSite({
        url,
        sshDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info(`Site with URL ${url} created successfully`);
      res.status(201).json(site);
    } catch (error) {
      logger.error("Error creating site:", error);
      res.status(500).json({ message: "Error creating site", error });
    }
  }

  async updateSite(req: Request, res: Response) {
    logger.debug(`Updating site with ID: ${req.params.id}`);
    try {
      const site = await this.siteRepository.updateSite(
        Number(req.params.id),
        req.body
      );
      if (site) {
        logger.info(`Site with ID ${req.params.id} updated successfully`);
        res.status(200).json(site);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error) {
      logger.error("Error updating site:", error);
      res.status(500).json({ message: "Error updating site", error });
    }
  }

  async deleteSite(req: Request, res: Response) {
    logger.debug(`Deleting site with ID: ${req.params.id}`);
    try {
      await this.siteRepository.deleteSite(Number(req.params.id));
      logger.info(`Site with ID ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting site:", error);
      res.status(500).json({ message: "Error deleting site", error });
    }
  }
}
