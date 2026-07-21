import { Router } from "express";
import { getDashboardSummary } from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = Router();

router.use(authenticate);
router.get("/summary", authorize("ADMIN", "AGENT", "CUSTOMER"), cacheMiddleware("reports", 120), getDashboardSummary);

export default router;
