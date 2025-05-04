import { Pool } from "pg";
import { Module } from "../models/ModuleModels";
import logger from "../utils/logger";

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

  async getAllModules(): Promise<Module[]> {
    try {
      const result = await this.pool.query("SELECT * FROM modules");
      return result.rows;
    } catch (error) {
      logger.error("Error fetching all modules:", error);
      throw new Error("Database error");
    }
  }
}
