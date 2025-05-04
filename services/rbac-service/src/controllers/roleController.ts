import { Request, Response } from "express";
import { UserRepository } from "../dal/UserRepository";
import logger from "../utils/logger";

export class RoleController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async createRole(req: Request, res: Response) {
    logger.debug("Creating role");
    const { name, description } = req.body;
    try {
      const role = await this.userRepository.createRole(name, description);
      logger.debug(`Role ${name} created successfully`);
      res.status(201).json(role);
    } catch (error) {
      logger.error("Error creating role:", error);
      res.status(500).json({ message: "Error creating role", error });
    }
  }

  async getAllRoles(req: Request, res: Response) {
    logger.debug("Fetching all roles");
    try {
      const roles = await this.userRepository.getAllRoles();
      logger.debug("Fetched all roles successfully");
      res.status(200).json(roles);
    } catch (error) {
      logger.error("Error fetching roles:", error);
      res.status(500).json({ message: "Error fetching roles", error });
    }
  }

  async getRoleById(req: Request, res: Response) {
    logger.debug("Fetching role by ID");
    const { id } = req.params;
    try {
      const role = await this.userRepository.getRoleById(Number(id));
      if (role) {
        logger.debug(`Fetched role with ID ${id} successfully`);
        res.status(200).json(role);
      } else {
        logger.warn(`Role with ID ${id} not found`);
        res.status(404).json({ message: "Role not found" });
      }
    } catch (error) {
      logger.error("Error fetching role:", error);
      res.status(500).json({ message: "Error fetching role", error });
    }
  }

  async updateRole(req: Request, res: Response) {
    logger.debug("Updating role");
    const { id } = req.params;
    const updates = req.body;
    try {
      const role = await this.userRepository.updateRole(Number(id), updates);
      if (role) {
        logger.debug(`Updated role with ID ${id} successfully`);
        res.status(200).json(role);
      } else {
        logger.warn(`Role with ID ${id} not found`);
        res.status(404).json({ message: "Role not found" });
      }
    } catch (error) {
      logger.error("Error updating role:", error);
      res.status(500).json({ message: "Error updating role", error });
    }
  }

  async deleteRole(req: Request, res: Response) {
    logger.debug("Deleting role");
    const { id } = req.params;
    try {
      await this.userRepository.deleteRole(Number(id));
      logger.debug(`Deleted role with ID ${id} successfully`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting role:", error);
      res.status(500).json({ message: "Error deleting role", error });
    }
  }

  async assignRole(req: Request, res: Response) {
    logger.debug("Assigning role to user in group");
    const { userId, groupId, roleId } = req.body;
    try {
      await this.userRepository.assignRole(userId, groupId, roleId);
      logger.debug(
        `Role ${roleId} assigned to user ${userId} in group ${groupId}`
      );
      res
        .status(200)
        .json({ message: "Role assigned to user in group successfully" });
    } catch (error) {
      logger.error("Error assigning role to user in group:", error);
      res
        .status(500)
        .json({ message: "Error assigning role to user in group", error });
    }
  }

  async assignRoleToGroup(req: Request, res: Response) {
    logger.debug("Assigning role to group");
    const { groupId, roleId } = req.body;
    try {
      await this.userRepository.assignRoleToGroup(groupId, roleId);
      logger.debug(`Role ${roleId} assigned to group ${groupId}`);
      res.status(200).json({ message: "Role assigned to group successfully" });
    } catch (error) {
      logger.error("Error assigning role to group:", error);
      res.status(500).json({ message: "Error assigning role to group", error });
    }
  }

  async getRolesForUser(req: Request, res: Response) {
    logger.debug("Fetching roles for user");
    const { userId } = req.params;
    try {
      const roles = await this.userRepository.getRolesForUser(Number(userId));
      logger.debug(`Fetched roles for user ${userId} successfully`);
      res.status(200).json(roles);
    } catch (error) {
      logger.error("Error fetching roles for user:", error);
      res.status(500).json({ message: "Error fetching roles for user", error });
    }
  }

  async getRolesForGroup(req: Request, res: Response) {
    logger.debug("Fetching roles for group");
    const { groupId } = req.params;
    try {
      const roles = await this.userRepository.getRolesForGroup(Number(groupId));
      logger.debug(`Fetched roles for group ${groupId} successfully`);
      res.status(200).json(roles);
    } catch (error) {
      logger.error("Error fetching roles for group:", error);
      res
        .status(500)
        .json({ message: "Error fetching roles for group", error });
    }
  }

  async getRolesForSite(req: Request, res: Response) {
    logger.debug("Fetching roles for site");
    const { siteId } = req.params;
    try {
      const roles = await this.userRepository.getRolesForSite(Number(siteId));
      logger.debug(`Fetched roles for site ${siteId} successfully`);
      res.status(200).json(roles);
    } catch (error) {
      logger.error("Error fetching roles for site:", error);
      res.status(500).json({ message: "Error fetching roles for site", error });
    }
  }
}
