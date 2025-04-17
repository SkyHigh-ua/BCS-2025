import { Pool } from "pg";
import logger from "../utils/logger";
import { Module, Site } from "../models/ModuleModels";

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

  async createModule(module: Module): Promise<Module> {
    try {
      const result = await this.pool.query(
        "INSERT INTO modules (name, description, script_file, inputs, outputs, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          module.name,
          module.description,
          module.scriptFile,
          module.inputs,
          module.outputs,
          module.createdAt,
          module.updatedAt,
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

export interface Site {
  id: number;
  domain: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
