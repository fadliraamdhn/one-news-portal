import { Router } from "express";
import { fetchNewsController, handleGetNews,  } from "~/controllers/news.controller";

const router = Router();

router.get("/cron", fetchNewsController);
router.get("/", handleGetNews);

export default router;