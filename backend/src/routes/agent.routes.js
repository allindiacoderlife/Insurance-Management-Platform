import { Router } from "express";
import {
  getAllAgents,
  createAgentAccount,
  toggleAgentVerification,
  resendAgentCredentials,
  deleteAgentAccount,
} from "../controllers/agent.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = Router();

// All agent management routes are restricted to ADMIN role
router.use(authenticate, authorize("ADMIN"));

router
  .route("/")
  .get(cacheMiddleware("agents", 120), getAllAgents)
  .post(createAgentAccount);

router.put("/:id/toggle-verify", toggleAgentVerification);
router.post("/:id/resend-credentials", resendAgentCredentials);
router.delete("/:id", deleteAgentAccount);

export default router;
