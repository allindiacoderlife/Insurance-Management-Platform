import { Router } from "express";
import { getDashboardSummary } from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/summary", authorize("ADMIN", "AGENT"), getDashboardSummary);

export default router;
