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
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role: number = 1,
    parentId?: number
  ): Promise<User> {
    try {
      const query = parentId
        ? `INSERT INTO users (first_name, last_name, email, password, role, parent_id) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
        : `INSERT INTO users (first_name, last_name, email, password, role) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`;

      const values = parentId
        ? [first_name, last_name, email, password, role, parentId]
        : [first_name, last_name, email, password, role];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating user:", error);
      throw new Error("Database error");
    }
  }

  async assignParentToUser(userId: number, parentId: number): Promise<void> {
    try {
      await this.pool.query(`UPDATE users SET parent_id = $1 WHERE id = $2`, [
        parentId,
        userId,
      ]);
    } catch (error) {
      logger.error(`Error assigning parent to user (${userId}):`, error);
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
        `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
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
}
