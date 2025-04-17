import { Pool } from "pg";
import logger from "../utils/logger";
import { Plugin, Site } from "../models/PluginModels";

export interface Plugin {
  id: number;
  name: string;
  description: string;
  repoLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: number;
  domain: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PluginRepository {
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

  async getAllPlugins(): Promise<Plugin[]> {
    try {
      const result = await this.pool.query("SELECT * FROM plugins");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all plugins:", error);
      throw new Error("Database error");
    }
  }

  async getPluginById(id: string): Promise<Plugin | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM plugins WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching plugin by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async createPlugin(plugin: Plugin): Promise<Plugin> {
    try {
      const result = await this.pool.query(
        "INSERT INTO plugins (type, created_at, updated_at) VALUES ($1, $2, $3) RETURNING *",
        [plugin.type, plugin.createdAt, plugin.updatedAt]
      );
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating plugin:", error);
      throw new Error("Database error");
    }
  }

  async updatePlugin(
    id: string,
    updates: Partial<Plugin>
  ): Promise<Plugin | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updates);
      const result = await this.pool.query(
        `UPDATE plugins SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating plugin (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async deletePlugin(id: string): Promise<void> {
    try {
      await this.pool.query("DELETE FROM plugins WHERE id = $1", [id]);
    } catch (error) {
      logger.error(`Error deleting plugin (${id}):`, error);
      throw new Error("Database error");
    }
  }
}
