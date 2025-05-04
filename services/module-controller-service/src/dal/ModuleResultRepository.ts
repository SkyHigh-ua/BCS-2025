import { Pool } from "pg";
import { ModuleResult } from "../models/ModuleResultModels";
import logger from "../utils/logger";

export class ModuleResultRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.pool.on("connect", () => {
      logger.debug("[DB] Module Result Repository connected successfully");
    });

    this.pool.on("error", (error) => {
      logger.error("Unexpected error on idle database client:", error);
    });
  }

  async saveModuleResult(result: ModuleResult): Promise<ModuleResult> {
    try {
      const query = `
        INSERT INTO module_results (site_id, module_id, timestamp, result_data)
        VALUES ($1, $2, $3, $4)
        RETURNING id, site_id, module_id, timestamp, result_data
      `;

      const values = [
        result.siteId,
        result.moduleId,
        result.timestamp || new Date(),
        result.data,
      ];

      const res = await this.pool.query(query, values);

      return {
        id: res.rows[0].id,
        siteId: res.rows[0].site_id,
        moduleId: res.rows[0].module_id,
        timestamp: res.rows[0].timestamp,
        data: res.rows[0].result_data,
      };
    } catch (error) {
      logger.error(`Error saving module result:`, error);
      throw new Error("Database error when saving module result");
    }
  }

  async getResultsBySiteId(siteId: number): Promise<ModuleResult[]> {
    try {
      const query = `
        SELECT id, site_id, module_id, timestamp, result_data
        FROM module_results
        WHERE site_id = $1
        ORDER BY timestamp DESC
      `;

      const res = await this.pool.query(query, [siteId]);

      return res.rows.map((row) => ({
        id: row.id,
        siteId: row.site_id,
        moduleId: row.module_id,
        timestamp: row.timestamp,
        data: row.result_data,
      }));
    } catch (error) {
      logger.error(`Error fetching module results for site ${siteId}:`, error);
      throw new Error("Database error when fetching module results");
    }
  }

  async getResultsByModuleId(moduleId: number): Promise<ModuleResult[]> {
    try {
      const query = `
        SELECT id, site_id, module_id, timestamp, result_data
        FROM module_results
        WHERE module_id = $1
        ORDER BY timestamp DESC
      `;

      const res = await this.pool.query(query, [moduleId]);

      return res.rows.map((row) => ({
        id: row.id,
        siteId: row.site_id,
        moduleId: row.module_id,
        timestamp: row.timestamp,
        data: row.result_data,
      }));
    } catch (error) {
      logger.error(
        `Error fetching module results for module ${moduleId}:`,
        error
      );
      throw new Error("Database error when fetching module results");
    }
  }
}
