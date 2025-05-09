import { Request, Response } from "express";
import { UserRepository } from "../dal/UserRepository";
import logger from "../utils/logger";

export class GroupController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async createGroup(req: Request, res: Response) {
    if (!req.user || !("id" in req.user)) {
      logger.info(`[${req.method}] ${req.url} - 401: User not authenticated`);
      return res.status(401).json({ message: "User not authenticated" });
    }
    logger.debug("Creating group");
    const { name, description } = req.body;
    const userId = req.user.id;
    try {
      const group = await this.userRepository.createGroup(
        name,
        description,
        userId
      );
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

  async assignGroupToSite(req: Request, res: Response) {
    logger.debug("Assigning group to site");
    const { groupId, siteId } = req.body;
    try {
      await this.userRepository.assignGroupToSite(groupId, siteId);
      logger.debug(`Group ${groupId} assigned to site ${siteId}`);
      res.status(200).json({ message: "Group assigned to site successfully" });
    } catch (error) {
      logger.error("Error assigning group to site:", error);
      res.status(500).json({ message: "Error assigning group to site", error });
    }
  }

  async assignGroupToUser(req: Request, res: Response) {
    logger.debug("Assigning group to user");
    const { groupId, userId } = req.body;
    try {
      await this.userRepository.assignGroupToUser(userId, groupId);
      logger.debug(`Group ${groupId} assigned to user ${userId}`);
      res.status(200).json({ message: "Group assigned to user successfully" });
    } catch (error) {
      logger.error("Error assigning group to user:", error);
      res.status(500).json({ message: "Error assigning group to user", error });
    }
  }

  async getGroupsOwnedByUser(req: Request, res: Response) {
    logger.debug("Fetching groups owned by user");
    const { userId } = req.params;
    try {
      const groups = await this.userRepository.getGroupsOwnedByUser(
        Number(userId)
      );
      logger.debug(`Fetched groups owned by user ${userId} successfully`);
      res.status(200).json(groups);
    } catch (error) {
      logger.error("Error fetching groups owned by user:", error);
      res
        .status(500)
        .json({ message: "Error fetching groups owned by user", error });
    }
  }

  async getGroupUsers(req: Request, res: Response) {
    logger.debug("Fetching users in group");
    const { groupId } = req.params;
    try {
      const users = await this.userRepository.getGroupUsers(Number(groupId));
      logger.debug(`Fetched users in group ${groupId} successfully`);
      res.status(200).json(users);
    } catch (error) {
      logger.error("Error fetching users in group:", error);
      res.status(500).json({ message: "Error fetching users in group", error });
    }
  }
}
