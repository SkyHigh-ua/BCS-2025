import { Request, Response } from "express";
import axios from "axios";
import logger from "../utils/logger";

export class ScheduleController {
  private schedules: Record<string, NodeJS.Timeout> = {};

  public async scheduleModule(req: Request, res: Response): Promise<void> {
    const { siteId, moduleId, interval } = req.body;

    logger.debug(
      `Scheduling module ${moduleId} for site ${siteId} with interval ${interval}ms`
    );

    if (this.schedules[`${siteId}-${moduleId}`]) {
      logger.warn(`Module ${moduleId} is already scheduled for site ${siteId}`);
      return res
        .status(400)
        .json({ message: "Module is already scheduled for this site" });
    }

    const task = setInterval(async () => {
      try {
        logger.info(`Executing module ${moduleId} for site ${siteId}`);
        await axios.post(
          `http://module-controller-service/api/modules/execute/${moduleId}`,
          { siteId }
        );
        logger.info(`Collecting core data for site ${siteId}`);
        await axios.post(
          `http://site-service/api/sites/${siteId}/collect-data`
        );
      } catch (error) {
        logger.error(
          `Error executing module ${moduleId} for site ${siteId}:`,
          error.message
        );
      }
    }, interval);

    this.schedules[`${siteId}-${moduleId}`] = task;
    logger.info(`Module ${moduleId} scheduled for site ${siteId}`);
    res.status(200).json({
      message: `Module ${moduleId} scheduled for site ${siteId} every ${interval}ms`,
    });
  }

  public unscheduleModule(req: Request, res: Response): void {
    const { siteId, moduleId } = req.params;

    logger.debug(`Unscheduling module ${moduleId} for site ${siteId}`);

    if (!this.schedules[`${siteId}-${moduleId}`]) {
      logger.warn(`Module ${moduleId} is not scheduled for site ${siteId}`);
      return res
        .status(404)
        .json({ message: "Module is not scheduled for this site" });
    }

    clearInterval(this.schedules[`${siteId}-${moduleId}`]);
    delete this.schedules[`${siteId}-${moduleId}`];
    logger.debug(`Module ${moduleId} unscheduled for site ${siteId}`);
    res
      .status(200)
      .json({ message: `Module ${moduleId} unscheduled for site ${siteId}` });
  }
}
