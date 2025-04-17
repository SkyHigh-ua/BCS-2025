import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { Request, Response } from "express";
import logger from "../utils/logger";

export class AuthController {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      logger.debug("Generating service token for user lookup");
      const token = jwt.sign(
        { service: "auth-service" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      logger.debug(`Fetching user details for username: ${username}`);
      const userResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/username/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!userResponse || !userResponse.data) {
        logger.warn(`User ${username} not found`);
        return res.status(404).json({ message: "User not found" });
      }

      const user = userResponse.data;
      logger.debug(`User details retrieved for username: ${username}`);

      if (user && (await bcrypt.compare(password, user.password))) {
        logger.debug("Password matched, generating login token");
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET!,
          { expiresIn: "1h" }
        );
        logger.info(`User ${username} logged in successfully`);
        res.status(200).json({ token });
      } else {
        logger.warn(`Invalid credentials for username: ${username}`);
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      logger.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in", error });
    }
  }

  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    try {
      logger.debug("Hashing user password");
      const hashedPassword = await bcrypt.hash(password, 10);

      logger.debug("Generating service token for user creation");
      const token = jwt.sign(
        { service: "auth-service" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      logger.debug(`Creating user with username: ${username}`);
      const userResponse = await axios.post(
        `${process.env.USER_SERVICE_URL}/`,
        {
          username,
          email,
          password: hashedPassword,
        },
        {
          headers: {
            "x-internal-service": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = userResponse.data;
      logger.debug(`User created successfully with username: ${username}`);

      const login_token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      logger.info(`User ${username} registered successfully`);
      res.status(201).json({ message: "User registered", user, login_token });
    } catch (error) {
      logger.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user", error });
    }
  }
}
