import { Router } from "express";
import { fetchNewsController, handleGetNews,  } from "~/controllers/news.controller";

const router = Router();

router.get("/news-cron", fetchNewsController);
router.get("/get-all-news", handleGetNews)

export default router;