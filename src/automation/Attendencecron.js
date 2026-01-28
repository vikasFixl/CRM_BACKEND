import cron from "node-cron";

import logger from "../../config/logger.js";
import RawTimeLog from "../models/NHRM/TimeAndAttendence/RawTimeLog.js";
import { deriveAttendanceForDate } from "../service/AttendenceDeriveService.js";

/**
 * TEMP CRON
 * Runs every 2 minutes (for testing / MVP)
 */
export const startAttendanceCron = () => {
  cron.schedule("*/2 * * * *", async () => {
    logger.info("⏱️ [AttendanceCron] Triggered (every 2 minutes)");

    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // For now: derive attendance for TODAY
      const targetDate = today;

      /* 1️⃣ Find orgs that actually have raw logs */
      const orgIds = await RawTimeLog.distinct("organizationId", {
        logicalDay: targetDate
      });

      if (!orgIds.length) {
        logger.info("[AttendanceCron] No raw logs found, skipping");
        return;
      }

      /* 2️⃣ Derive attendance per org */
      for (const organizationId of orgIds) {
        logger.info("[AttendanceCron] Deriving attendance", {
          organizationId,
          date: targetDate.toISOString()
        });

        await deriveAttendanceForDate({
          organizationId,
          date: targetDate
        });
      }

      logger.info("✅ [AttendanceCron] Completed successfully");
    } catch (err) {
      logger.error("❌ [AttendanceCron] Failed", {
        message: err.message,
        stack: err.stack
      });
    }
  });
};
