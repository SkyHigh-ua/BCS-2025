import { Pool } from "pg";
import { ModuleResult } from "../models/ModuleModels";
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
      // First, get the site_modules id for the given site and module
      const siteModuleQuery = `
        SELECT id FROM site_modules
        WHERE site_id = $1 AND module_id = $2
      `;
      const siteModuleResult = await this.pool.query(siteModuleQuery, [
        result.siteId,
        result.moduleId,
      ]);

      if (siteModuleResult.rows.length === 0) {
        throw new Error(
          `No site_module found for site ${result.siteId} and module ${result.moduleId}`
        );
      }

      const siteModuleId = siteModuleResult.rows[0].id;

      // Then insert into site_data with the correct site_modules id
      const query = `
        INSERT INTO site_data (module_id, timestamp, data)
        VALUES ($1, $2, $3)
        RETURNING id, module_id, timestamp, data
      `;

      const values = [
        siteModuleId,
        result.timestamp || new Date(),
        result.data,
      ];

      const res = await this.pool.query(query, values);

      return {
        id: res.rows[0].id,
        siteId: result.siteId, // We need to pass this through since it's not in the returned data
        moduleId: result.moduleId, // We need to pass this through since it's not directly in the returned data
        timestamp: res.rows[0].timestamp,
        data: res.rows[0].data, // Correct column name is 'data', not 'result_data'
      };
    } catch (error) {
      logger.error(`Error saving module result:`, error);
      throw new Error("Database error when saving module result");
    }
  }

  async getResultsBySiteId(siteId: number): Promise<ModuleResult[]> {
    try {
      const query = `
        SELECT sd.id, sm.site_id, sm.module_id, sd.timestamp, sd.data
        FROM site_data sd
        JOIN site_modules sm ON sd.module_id = sm.id
        WHERE sm.site_id = $1
        ORDER BY sd.timestamp DESC
      `;

      const res = await this.pool.query(query, [siteId]);

      return res.rows.map((row) => ({
        id: row.id,
        siteId: row.site_id,
        moduleId: row.module_id,
        timestamp: row.timestamp,
        data: row.data, // Correct column name
      }));
    } catch (error) {
      logger.error(`Error fetching module results for site ${siteId}:`, error);
      throw new Error("Database error when fetching module results");
    }
  }

  async getResultsByModuleId(moduleId: number): Promise<ModuleResult[]> {
    try {
      const query = `
        SELECT sd.id, sm.site_id, sm.module_id, sd.timestamp, sd.data
        FROM site_data sd
        JOIN site_modules sm ON sd.module_id = sm.id
        WHERE sm.module_id = $1
        ORDER BY sd.timestamp DESC
      `;

      const res = await this.pool.query(query, [moduleId]);

      return res.rows.map((row) => ({
        id: row.id,
        siteId: row.site_id,
        moduleId: row.module_id,
        timestamp: row.timestamp,
        data: row.data, // Correct column name
      }));
    } catch (error) {
      logger.error(
        `Error fetching module results for module ${moduleId}:`,
        error
      );
      throw new Error("Database error when fetching module results");
    }
  }

  async getLatestModuleResult(
    siteId: number,
    moduleId: number
  ): Promise<ModuleResult | null> {
    try {
      const query = `
        SELECT sd.id, sm.site_id, sm.module_id, sd.timestamp, sd.data
        FROM site_data sd
        JOIN site_modules sm ON sd.module_id = sm.id
        WHERE sm.site_id = $1 AND sm.module_id = $2
        ORDER BY sd.timestamp DESC
        LIMIT 1
      `;

      const res = await this.pool.query(query, [siteId, moduleId]);

      if (res.rows.length === 0) {
        return null;
      }

      return {
        id: res.rows[0].id,
        siteId: res.rows[0].site_id,
        moduleId: res.rows[0].module_id,
        timestamp: res.rows[0].timestamp,
        data: res.rows[0].data, // Correct column name
      };
    } catch (error) {
      logger.error(
        `Error fetching latest module result for site ${siteId} and module ${moduleId}:`,
        error
      );
      throw new Error("Database error when fetching latest module result");
    }
  }

  async getLatestModuleResultByModuleId(
    moduleId: number
  ): Promise<ModuleResult | null> {
    try {
      const query = `
        SELECT sd.id, sm.site_id, sm.module_id, sd.timestamp, sd.data
        FROM site_data sd
        JOIN site_modules sm ON sd.module_id = sm.id
        WHERE sm.module_id = $1
        ORDER BY sd.timestamp DESC
        LIMIT 1
      `;

      const res = await this.pool.query(query, [moduleId]);

      if (res.rows.length === 0) {
        return null;
      }

      return {
        id: res.rows[0].id,
        siteId: res.rows[0].site_id,
        moduleId: res.rows[0].module_id,
        timestamp: res.rows[0].timestamp,
        data: res.rows[0].data, // Correct column name
      };
    } catch (error) {
      logger.error(
        `Error fetching latest module result for module ${moduleId}:`,
        error
      );
      throw new Error("Database error when fetching latest module result");
    }
  }
}
