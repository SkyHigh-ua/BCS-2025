import { Request, Response } from "express";
import { UserRepository } from "../dal/UserRepository";
import logger from "../utils/logger";

export class GroupController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async createGroup(req: Request, res: Response) {
    logger.debug("Creating group");
    const { name, description } = req.body;
    try {
      const group = await this.userRepository.createGroup(name, description);
      logger.debug(`Group ${name} created successfully`);
      res.status(201).json(group);
    } catch (error) {
      logger.error("Error creating group:", error);
      res.status(500).json({ message: "Error creating group", error });
    }
  }

  async getAllGroups(req: Request, res: Response) {
    logger.debug("Fetching all groups");
    try {
      const groups = await this.userRepository.getAllGroups();
      logger.debug("Fetched all groups successfully");
      res.status(200).json(groups);
    } catch (error) {
      logger.error("Error fetching groups:", error);
      res.status(500).json({ message: "Error fetching groups", error });
    }
  }

  async getGroupById(req: Request, res: Response) {
    logger.debug("Fetching group by ID");
    const { id } = req.params;
    try {
      const group = await this.userRepository.getGroupById(Number(id));
      if (group) {
        logger.debug(`Fetched group with ID ${id} successfully`);
        res.status(200).json(group);
      } else {
        logger.warn(`Group with ID ${id} not found`);
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      logger.error("Error fetching group:", error);
      res.status(500).json({ message: "Error fetching group", error });
    }
  }

  async updateGroup(req: Request, res: Response) {
    logger.debug("Updating group");
    const { id } = req.params;
    const updates = req.body;
    try {
      const group = await this.userRepository.updateGroup(Number(id), updates);
      if (group) {
        logger.debug(`Updated group with ID ${id} successfully`);
        res.status(200).json(group);
      } else {
        logger.warn(`Group with ID ${id} not found`);
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      logger.error("Error updating group:", error);
      res.status(500).json({ message: "Error updating group", error });
    }
  }

  async deleteGroup(req: Request, res: Response) {
    logger.debug("Deleting group");
    const { id } = req.params;
    try {
      await this.userRepository.deleteGroup(Number(id));
      logger.debug(`Deleted group with ID ${id} successfully`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting group:", error);
      res.status(500).json({ message: "Error deleting group", error });
    }
  }
}
