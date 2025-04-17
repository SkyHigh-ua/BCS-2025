import { Request, Response } from "express";
import { UserRepository } from "../dal/UserRepository";
import logger from "../utils/logger";

export class UserController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getAllUsers(req: Request, res: Response) {
    logger.debug("Fetching all users");
    try {
      const users = await this.userRepository.getAllUsers();
      logger.info("Fetched all users successfully");
      res.status(200).json(users);
    } catch (error) {
      logger.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error });
    }
  }

  async getUserById(req: Request, res: Response) {
    logger.debug(`Fetching user by ID: ${req.params.id}`);
    try {
      const user = await this.userRepository.getUserById(Number(req.params.id));
      if (user) {
        logger.info(`User with ID ${req.params.id} fetched successfully`);
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user", error });
    }
  }

  async getUserByUsername(req: Request, res: Response) {
    logger.debug(`Fetching user by username: ${req.params.username}`);
    try {
      const user = await this.userRepository.getUserByUsername(
        req.params.username
      );
      if (user) {
        logger.info(
          `User with username ${req.params.username} fetched successfully`
        );
        res.status(200).json(user);
      } else {
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
    logger.debug(`Fetching user by email: ${req.params.email}`);
    try {
      const user = await this.userRepository.getUserByEmail(req.params.email);
      if (user) {
        logger.info(`User with email ${req.params.email} fetched successfully`);
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error fetching user by email:", error);
      res.status(500).json({ message: "Error fetching user by email", error });
    }
  }

  async createUser(req: Request, res: Response) {
    if (!req.headers["x-internal-service"]) {
      return res
        .status(403)
        .json({ message: "Forbidden: External requests are not allowed" });
    }

    const { username, email, password } = req.body;
    logger.debug(`Creating user with username: ${username}, email: ${email}`);
    try {
      const user = await this.userRepository.createUser(
        username,
        email,
        password
      );
      logger.info(`User with username ${username} created successfully`);
      res.status(201).json(user);
    } catch (error) {
      logger.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error });
    }
  }

  async updateUser(req: Request, res: Response) {
    logger.debug(`Updating user with ID: ${req.params.id}`);
    try {
      const user = await this.userRepository.updateUser(
        Number(req.params.id),
        req.body
      );
      if (user) {
        logger.info(`User with ID ${req.params.id} updated successfully`);
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    logger.debug(`Deleting user with ID: ${req.params.id}`);
    try {
      await this.userRepository.deleteUser(Number(req.params.id));
      logger.info(`User with ID ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user", error });
    }
  }
}
