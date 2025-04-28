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
    tags: string[];
  }): Promise<any> {
    const query = `
      INSERT INTO public.plugins (name, description, requirements, repo_link, tags, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      plugin.name,
      plugin.description,
      plugin.requirements,
      plugin.repoLink,
      plugin.tags,
      new Date(),
      new Date(),
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
      tags?: string[];
    }
  ): Promise<any> {
    const query = `
      UPDATE public.plugins
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        requirements = COALESCE($3, requirements),
        repo_link = COALESCE($4, repo_link),
        tags = COALESCE($5, tags),
        updated_at = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      plugin.name,
      plugin.description,
      plugin.requirements,
      plugin.repoLink,
      plugin.tags,
      new Date(),
      pluginId,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
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
      WHERE $1 && tags;
    `;
    const values = [tags];
    const result = await this.pool.query(query, values);
    return result.rows;
  }
}
