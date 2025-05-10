import { Pool } from "pg";
import logger from "../utils/logger";
import { Module } from "../models/ModuleModels";

export class ModuleRepository {
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

  async getAllModules(): Promise<Module[]> {
    try {
      const result = await this.pool.query("SELECT * FROM modules");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all modules:", error);
      throw new Error("Database error");
    }
  }

  async getModuleById(id: string): Promise<Module | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM modules WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching module by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async createModule(
    module: Omit<Module, "id" | "createdAt" | "updatedAt">
  ): Promise<Module> {
    try {
      const result = await this.pool.query(
        `INSERT INTO modules (name, description, repo_link, inputs, outputs, tags)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          module.name,
          module.description,
          module.repoLink,
          module.inputs,
          module.outputs,
          module.tags,
        ]
      );
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating module:", error);
      throw new Error("Database error");
    }
  }

  async updateModule(
    id: string,
    updates: Partial<Module>
  ): Promise<Module | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updates);
      const result = await this.pool.query(
        `UPDATE modules SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating module (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async deleteModule(id: string): Promise<void> {
    try {
      await this.pool.query("DELETE FROM modules WHERE id = $1", [id]);
    } catch (error) {
      logger.error(`Error deleting module (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async getModulesBySiteId(siteId: number): Promise<Module[]> {
    try {
      const result = await this.pool.query(
        `SELECT m.* FROM modules m
         JOIN site_modules sm ON m.id = sm.module_id
         WHERE sm.site_id = $1`,
        [siteId]
      );
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching modules for site (${siteId}):`, error);
      throw new Error("Database error");
    }
  }

  async assignModulesToSite(
    siteId: number,
    moduleIds: number[]
  ): Promise<void> {
    try {
      const values = moduleIds
        .map((moduleId) => `(${siteId}, ${moduleId})`)
        .join(", ");
      const query = `INSERT INTO site_modules (site_id, module_id) VALUES ${values}`;
      await this.pool.query(query);
      logger.debug(
        `Modules [${moduleIds.join(", ")}] assigned to site ${siteId}`
      );
    } catch (error) {
      logger.error(
        `Error assigning modules [${moduleIds.join(
          ", "
        )}] to site (${siteId}):`,
        error
      );
      throw new Error("Database error");
    }
  }

  async removeModulesFromSite(
    siteId: number,
    moduleIds: number[]
  ): Promise<void> {
    try {
      const placeholders = moduleIds
        .map((_, index) => `$${index + 2}`)
        .join(", ");
      const query = `DELETE FROM site_modules 
                     WHERE site_id = $1 
                     AND module_id IN (${placeholders})`;

      await this.pool.query(query, [siteId, ...moduleIds]);
      logger.debug(
        `Modules [${moduleIds.join(", ")}] removed from site ${siteId}`
      );
    } catch (error) {
      logger.error(
        `Error removing modules [${moduleIds.join(
          ", "
        )}] from site (${siteId}):`,
        error
      );
      throw new Error("Database error");
    }
  }

  async getModulesByTags(tags: string[]): Promise<Module[]> {
    try {
      const query = `
        SELECT * FROM modules
        WHERE tags && $1::varchar[]`;
      const result = await this.pool.query(query, [tags]);
      return result.rows;
    } catch (error) {
      logger.error("Error fetching modules by tags:", error);
      throw new Error("Database error");
    }
  }
}
