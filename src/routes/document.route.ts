import { Router } from "express";
import { handleDocumentGetAll, handleGetCompanySuggestions } from "~/controllers/document.controller";

const router = Router();

router.get("/", handleDocumentGetAll)
router.get("/company", handleGetCompanySuggestions);

export default router