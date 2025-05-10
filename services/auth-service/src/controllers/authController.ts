import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { Request, Response } from "express";
import logger from "../utils/logger";

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const token = jwt.sign(
        { service: "auth-service" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const userResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/email/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!userResponse || !userResponse.data) {
        logger.warn(
          `[${req.method}] ${req.url} - 404: User ${email} not found`
        );
        return res.status(404).json({ message: "User not found" });
      }

      const user = userResponse.data;
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: "24h" }
        );
        logger.info(
          `[${req.method}] ${req.url} - 200: User ${email} logged in successfully`
        );
        res.status(200).json({ token });
      } else {
        logger.warn(
          `[${req.method}] ${req.url} - 401: Invalid credentials for user: ${email}`
        );
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      logger.error(`[${req.method}] ${req.url} - 500: Error logging in`, error);
      res.status(500).json({ message: "Error logging in", error });
    }
  }

  async register(req: Request, res: Response) {
    const { email, password, first_name, last_name, company } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const token = jwt.sign(
        { service: "auth-service" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const userResponse = await axios.post(
        `${process.env.USER_SERVICE_URL}/`,
        {
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role: 1,
        },
        {
          headers: {
            "x-internal-service": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = userResponse.data;

      const login_token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      if (company) {
        const groupResponse = await axios.post(
          `${process.env.RBAC_SERVICE_URL}/groups/`,
          { name: company, description: company },
          {
            headers: {
              Authorization: `Bearer ${login_token}`,
            },
          }
        );
        const groupId = groupResponse.data.id;

        logger.info(
          `[${req.method}] ${req.url} - Group created and assigned for company: ${company}`
        );
      }

      logger.info(
        `[${req.method}] ${req.url} - 201: User with email ${email} registered successfully`
      );
      res.status(201).json({ message: "User registered", user, login_token });
    } catch (error) {
      logger.error(
        `[${req.method}] ${req.url} - 500: Error registering user`,
        error
      );
      res.status(500).json({ message: "Error registering user", error });
    }
  }
}
