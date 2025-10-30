import cron from "node-cron";
import { fetchAndCategorizeNews } from "~/services/news.service";
import { logger } from "~/utils/logger";
import { AppError } from "~/utils/appError";

cron.schedule("*/30 * * * *", async () => {
    logger.info("[Cron] Memulai fetch berita...");
    try {
        await fetchAndCategorizeNews();
        logger.info("[Cron] Berhasil update berita.");
    } catch (error) {
        const err = error instanceof Error ? error : new AppError("Cron gagal tanpa error detail");
        logger.error(`[Cron Error] ${err.message}`);
    }
});
