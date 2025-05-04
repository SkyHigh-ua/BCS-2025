import { Request, Response } from "express";
import { UserRepository } from "../dal/UserRepository";
import logger from "../utils/logger";
import axios from "axios";

export class UserController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.getAllUsers();
      logger.info(`[${req.method}] ${req.url} - 200: Fetched all users`);
      res.status(200).json(users);
    } catch (error) {
      logger.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.getUserById(Number(req.params.id));
      if (user) {
        logger.info(`[${req.method}] ${req.url} - 200: User found`);
        res.status(200).json(user);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: User not found`);
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user", error });
    }
  }

  async getUserByEmail(req: Request, res: Response) {
    try {
      const user = await this.userRepository.getUserByEmail(req.params.email);
      if (user) {
        logger.info(`[${req.method}] ${req.url} - 200: User found`);
        res.status(200).json(user);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: User not found`);
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error fetching user by email:", error);
      res.status(500).json({ message: "Error fetching user by email", error });
    }
  }

  async createUser(req: Request, res: Response) {
    const { first_name, last_name, email, password, role, company } = req.body;
    try {
      const user = await this.userRepository.createUser(
        first_name,
        last_name,
        email,
        password,
        role
      );

      if (company) {
        const groupResponse = await axios.post(
          `${process.env.RBAC_SERVICE_URL}/groups/`,
          { companyName: company }
        );
        const groupId = groupResponse.data.id;

        await axios.post(`${process.env.RBAC_SERVICE_URL}/groups/assign`, {
          userId: user.id,
          groupId: groupId,
        });

        logger.info(
          `[${req.method}] ${req.url} - Group created and assigned for company: ${company}`
        );
      }

      logger.info(`[${req.method}] ${req.url} - 201: User created`);
      res.status(201).json(user);
    } catch (error) {
      logger.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error });
    }
  }

  async createSubUser(req: Request, res: Response) {
    const {
      first_name,
      last_name,
      email,
      password,
      company_id,
      role_id,
      parent_id,
    } = req.body;
    try {
      const user = await this.userRepository.createUser(
        first_name,
        last_name,
        email,
        password,
        2,
        parent_id
      );

      await axios.post(`${process.env.RBAC_SERVICE_URL}/groups/assign`, {
        userId: user.id,
        groupId: company_id,
      });
      logger.info(
        `[${req.method}] ${req.url} - Group assigned for user: ${email}`
      );

      await axios.post(`${process.env.RBAC_SERVICE_URL}/roles/assign`, {
        userId: user.id,
        roleId: role_id,
      });
      logger.info(
        `[${req.method}] ${req.url} - Role assigned for user: ${email}`
      );

      logger.info(`[${req.method}] ${req.url} - 201: Sub-user created`);
      res.status(201).json(user);
    } catch (error) {
      logger.error("Error creating sub-user:", error);
      res.status(500).json({ message: "Error creating sub-user", error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.updateUser(
        Number(req.params.id),
        req.body
      );
      if (user) {
        logger.info(`[${req.method}] ${req.url} - 200: User updated`);
        res.status(200).json(user);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: User not found`);
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await this.userRepository.deleteUser(Number(req.params.id));
      logger.info(`[${req.method}] ${req.url} - 200: User deleted`);
      // Change from 204 with no content to 200 with success message
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user", error });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user || !("id" in req.user)) {
        logger.info(`[${req.method}] ${req.url} - 401: User not authenticated`);
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userId = req.user.id;
      const user = await this.userRepository.getUserById(userId);

      if (user) {
        logger.info(`[${req.method}] ${req.url} - 200: Current user fetched`);
        res.status(200).json(user);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: Current user not found`);
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error fetching current user:", error);
      res.status(500).json({ message: "Error fetching current user", error });
    }
  }
}
