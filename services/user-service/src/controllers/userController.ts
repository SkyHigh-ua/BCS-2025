import { Request, Response } from "express";
import { UserRepository } from "../dal/UserRepository";
import logger from "../utils/logger";

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

  async getUserByUsername(req: Request, res: Response) {
    try {
      const user = await this.userRepository.getUserByUsername(
        req.params.username
      );
      if (user) {
        logger.info(`[${req.method}] ${req.url} - 200: User found`);
        res.status(200).json(user);
      } else {
        logger.info(`[${req.method}] ${req.url} - 404: User not found`);
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error fetching user by username:", error);
      res
        .status(500)
        .json({ message: "Error fetching user by username", error });
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
    if (!req.headers["x-internal-service"]) {
      logger.info(`[${req.method}] ${req.url} - 403: Forbidden`);
      return res
        .status(403)
        .json({ message: "Forbidden: External requests are not allowed" });
    }

    const { username, email, password } = req.body;
    try {
      const user = await this.userRepository.createUser(
        username,
        email,
        password
      );
      logger.info(`[${req.method}] ${req.url} - 201: User created`);
      res.status(201).json(user);
    } catch (error) {
      logger.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error });
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
      logger.info(`[${req.method}] ${req.url} - 204: User deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user", error });
    }
  }
}
