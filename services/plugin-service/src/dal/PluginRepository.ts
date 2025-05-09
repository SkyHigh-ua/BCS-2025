import { Pool } from "pg";
import logger from "../utils/logger";
import { Plugin, Site } from "../models/PluginModels";

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

  async createPlugin(plugin: {
    name: string;
    description: string;
    requirements: any;
    repoLink: string;
    fqdn?: string;
    outputs?: any;
    tags: string[];
  }): Promise<any> {
    const query = `
      INSERT INTO public.plugins (name, description, requirements, repo_link, fqdn, outputs, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      plugin.name,
      plugin.description,
      plugin.requirements,
      plugin.repoLink,
      plugin.fqdn || null,
      plugin.outputs || null,
      plugin.tags,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async updatePlugin(
    pluginId: string,
    plugin: {
      name?: string;
      description?: string;
      requirements?: any;
      repoLink?: string;
      fqdn?: string;
      outputs?: any;
      tags?: string[];
    }
  ): Promise<any> {
    try {
      const fields = Object.keys(plugin)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(plugin);
      const result = await this.pool.query(
        `UPDATE roles SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, pluginId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating plugin (${pluginId}):`, error);
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

  async assignPluginToSite(pluginId: string, siteId: string): Promise<any> {
    const query = `
      INSERT INTO public.site_plugins (site_id, plugin_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const values = [siteId, pluginId];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findPluginsByTags(tags: string[]): Promise<any[]> {
    const query = `
      SELECT * FROM public.plugins
      WHERE tags && $1::text[];
    `;
    const values = [tags];
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getSitePlugins(siteId: string): Promise<any[]> {
    try {
      const query = `
        SELECT p.* FROM plugins p
        JOIN site_plugins sp ON p.id = sp.plugin_id
        WHERE sp.site_id = $1;
      `;
      const result = await this.pool.query(query, [siteId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching plugins for site (${siteId}):`, error);
      throw new Error("Database error");
    }
  }
}
