import { Pool } from "pg";
import logger from "../utils/logger";

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.pool.on("connect", () => {
      logger.debug("Database connected successfully");
    });

    this.pool.on("error", (error) => {
      logger.error("Unexpected error on idle database client:", error);
    });
  }

  async getAllUsers() {
    try {
      const result = await this.pool.query("SELECT * FROM users");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all users:", error);
      throw new Error("Database error");
    }
  }

  async getUserById(id: number) {
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

  async getUserByUsername(username: string) {
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

  async getUserByEmail(email: string) {
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

  async createUser(username: string, email: string, password: string) {
    try {
      const result = await this.pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, password]
      );
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating user:", error);
      throw new Error("Database error");
    }
  }

  async updateUser(
    id: number,
    updates: Partial<{ username: string; email: string; password: string }>
  ) {
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

  async deleteUser(id: number) {
    try {
      await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
    } catch (error) {
      logger.error(`Error deleting user (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async assignRoleToUser(userId: number, roleId: number) {
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

  async assignGroupToUser(userId: number, groupId: number) {
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
