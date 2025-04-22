import { Pool } from "pg";
import logger from "../utils/logger";
import { Site, Plugin, Module } from "../models/SiteModels";

export class SiteRepository {
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

  async getAllSites(): Promise<Site[]> {
    try {
      const result = await this.pool.query("SELECT * FROM sites");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all sites:", error);
      throw new Error("Database error");
    }
  }

  async getSiteById(id: number): Promise<Site | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM sites WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching site by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async createSite(site: Site): Promise<Site> {
    try {
      const result = await this.pool.query(
        "INSERT INTO sites (url, ssh_details, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *",
        [site.url, site.sshDetails, site.createdAt, site.updatedAt]
      );
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating site:", error);
      throw new Error("Database error");
    }
  }

  async updateSite(id: number, updates: Partial<Site>): Promise<Site | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updates);
      const result = await this.pool.query(
        `UPDATE sites SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating site (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async deleteSite(id: number): Promise<void> {
    try {
      await this.pool.query("DELETE FROM sites WHERE id = $1", [id]);
    } catch (error) {
      logger.error(`Error deleting site (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async getUserSites(userId: number): Promise<Site[]> {
    try {
      const query = `
        SELECT DISTINCT s.*
        FROM sites s
        LEFT JOIN site_groups sg ON s.id = sg.site_id
        LEFT JOIN group_users gu ON sg.group_id = gu.group_id
        WHERE s.owner_id = $1 OR gu.user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching sites for user (${userId}):`, error);
      throw new Error("Database error");
    }
  }

  async addPluginToSite(siteId: number, pluginId: string): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO site_plugins (site_id, plugin_id) VALUES ($1, $2)",
        [siteId, pluginId]
      );
    } catch (error) {
      logger.error(
        `Error adding plugin (${pluginId}) to site (${siteId}):`,
        error
      );
      throw new Error("Database error");
    }
  }
}

export interface Site {
  id: number;
  domain: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plugin {
  id: number;
  name: string;
  description: string;
  repoLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: number;
  name: string;
  description: string;
  scriptFile: string;
  inputs: any;
  outputs: any;
  createdAt: Date;
  updatedAt: Date;
}
