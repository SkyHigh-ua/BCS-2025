import { Pool } from "pg";
import logger from "../utils/logger";
import { User, Role, Group } from "../models/UserModels";

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.pool.on("connect", () => {
      logger.debug("[DB] Database connected successfully");
    });

    this.pool.on("error", (error) => {
      logger.error("Unexpected error on idle database client:", error);
    });
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.pool.query("SELECT * FROM users");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all users:", error);
      throw new Error("Database error");
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching user by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching user by username (${username}):`, error);
      throw new Error("Database error");
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching user by email (${email}):`, error);
      throw new Error("Database error");
    }
  }

  async createUser(
    username: string,
    email: string,
    password: string,
    role: number = 1
  ): Promise<User> {
    try {
      const result = await this.pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [username, email, password, role]
      );
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating user:", error);
      throw new Error("Database error");
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updates);
      const result = await this.pool.query(
        `UPDATE users SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating user (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
    } catch (error) {
      logger.error(`Error deleting user (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [userId, roleId]
      );
    } catch (error) {
      logger.error(
        `Error assigning role (${roleId}) to user (${userId}):`,
        error
      );
      throw new Error("Database error");
    }
  }

  async assignGroupToUser(userId: number, groupId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
        [userId, groupId]
      );
    } catch (error) {
      logger.error(
        `Error assigning group (${groupId}) to user (${userId}):`,
        error
      );
      throw new Error("Database error");
    }
  }
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
