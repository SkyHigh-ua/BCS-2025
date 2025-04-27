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
      return result.rows.map((row) => ({
        id: row.id,
        domain: row.domain,
        name: row.name,
        description: row.description,
        author: row.author,
        createdAt: row.created_at,
      }));
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
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        domain: row.domain,
        name: row.name,
        description: row.description,
        author: row.author,
        createdAt: row.created_at,
      };
    } catch (error) {
      logger.error(`Error fetching site by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async createSite(site: Site): Promise<Site> {
    try {
      const result = await this.pool.query(
        "INSERT INTO sites (domain, name, description, author) VALUES ($1, $2, $3, $4) RETURNING *",
        [site.domain, site.name, site.description, site.author]
      );
      const row = result.rows[0];
      return {
        id: row.id,
        domain: row.domain,
        name: row.name,
        description: row.description,
        author: row.author,
        createdAt: row.created_at,
      };
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
        SELECT s.*
        FROM sites s
        WHERE s.author = $1
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows.map((row) => ({
        id: row.id,
        domain: row.domain,
        name: row.name,
        description: row.description,
        author: row.author,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error(`Error fetching sites for user (${userId}):`, error);
      throw new Error("Database error");
    }
  }
}
