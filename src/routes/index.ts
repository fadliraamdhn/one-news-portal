import { Router } from "express";
import newsRoutes from "~/routes/news.route";
import documentRoutes from "~/routes/document.route";

const router = Router();

router.use("/news", newsRoutes);
router.use("/document", documentRoutes);

export default router;
