import { Pool } from "pg";
import logger from "../utils/logger";

export class SiteRepository {
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

  async getAllSites() {
    try {
      const result = await this.pool.query("SELECT * FROM sites");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all sites:", error);
      throw new Error("Database error");
    }
  }

  async getSiteById(id: number) {
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

  async createSite(site: {
    url: string;
    sshDetails: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
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

  async updateSite(
    id: number,
    updates: Partial<{ url: string; sshDetails: string }>
  ) {
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

  async deleteSite(id: number) {
    try {
      await this.pool.query("DELETE FROM sites WHERE id = $1", [id]);
    } catch (error) {
      logger.error(`Error deleting site (${id}):`, error);
      throw new Error("Database error");
    }
  }
}
