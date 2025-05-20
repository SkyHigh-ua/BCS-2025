import { Request, Response } from "express";
import axios from "axios";
import logger from "../utils/logger";
import { CronExpressionParser } from "cron-parser";

export class ScheduleController {
  private schedules: Record<string, NodeJS.Timeout> = {};

  public async scheduleModule(req: Request, res: Response): Promise<void> {
    const { siteId, moduleId, cronExpression } = req.body;

    try {
      const interval = CronExpressionParser.parse(cronExpression);
      const nextRun = interval.next().toDate();
      const timeUntilNextRun = nextRun.getTime() - Date.now();

      logger.debug(
        `Scheduling module ${moduleId} for site ${siteId} with next run at ${nextRun.toISOString()}`
      );

      if (this.schedules[`${siteId}-${moduleId}`]) {
        logger.warn(
          `Module ${moduleId} is already scheduled for site ${siteId}`
        );
        res
          .status(400)
          .json({ message: "Module is already scheduled for this site" });
        return Promise.resolve();
      }

      this.scheduleCronTask(siteId, moduleId, cronExpression, timeUntilNextRun);

      logger.info(`Module ${moduleId} scheduled for site ${siteId}`);
      res.status(200).json({
        message: `Module ${moduleId} scheduled for site ${siteId} with next execution at ${nextRun.toISOString()}`,
      });
    } catch (error) {
      logger.error(`Error scheduling module: ${(error as Error).message}`);
      res.status(400).json({
        message: `Invalid cron expression: ${(error as Error).message}`,
      });
    }
  }

  private scheduleCronTask(
    siteId: string,
    moduleId: string,
    cronExpression: string,
    initialDelay: number
  ): void {
    const task = setTimeout(async () => {
      try {
        logger.info(`Executing module ${moduleId} for site ${siteId}`);
        await axios.post(
          `${process.env.MODULE_CONTROLLER_SERVICE_URL}/execute/${moduleId}`,
          { siteId }
        );
      } catch (error) {
        logger.error(
          `Error executing module ${moduleId} for site ${siteId}:`,
          (error as Error).message
        );
      }

      try {
        const interval = CronExpressionParser.parse(cronExpression);
        const nextRun = interval.next().toDate();
        const timeUntilNextRun = nextRun.getTime() - Date.now();

        logger.debug(
          `Next execution of ${moduleId} for site ${siteId} scheduled at ${nextRun.toISOString()}`
        );

        delete this.schedules[`${siteId}-${moduleId}`];

        this.scheduleCronTask(
          siteId,
          moduleId,
          cronExpression,
          timeUntilNextRun
        );
      } catch (error) {
        logger.error(
          `Error scheduling next execution: ${(error as Error).message}`
        );
      }
    }, initialDelay);

    this.schedules[`${siteId}-${moduleId}`] = task;
  }

  public unscheduleModule(req: Request, res: Response): Response {
    const { siteId, moduleId } = req.params;

    logger.debug(`Unscheduling module ${moduleId} for site ${siteId}`);

    if (!this.schedules[`${siteId}-${moduleId}`]) {
      logger.warn(`Module ${moduleId} is not scheduled for site ${siteId}`);
      return res
        .status(404)
        .json({ message: "Module is not scheduled for this site" });
    }

    clearTimeout(this.schedules[`${siteId}-${moduleId}`]);
    delete this.schedules[`${siteId}-${moduleId}`];
    logger.debug(`Module ${moduleId} unscheduled for site ${siteId}`);
    return res
      .status(200)
      .json({ message: `Module ${moduleId} unscheduled for site ${siteId}` });
  }
}
