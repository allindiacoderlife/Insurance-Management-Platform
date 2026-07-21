import { Router } from "express";
import {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  renewPolicy,
  cancelPolicy,
  deletePolicy,
} from "../controllers/policy.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPolicySchema,
  renewPolicySchema,
} from "../validations/policy.validation.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(cacheMiddleware("policies", 120), getAllPolicies)
  .post(authorize("ADMIN", "AGENT"), validate(createPolicySchema), createPolicy);

router
  .route("/:id")
  .get(cacheMiddleware("policy_detail", 120), getPolicyById)
  .delete(authorize("ADMIN"), deletePolicy);

router
  .route("/:id/renew")
  .put(authorize("ADMIN", "AGENT"), validate(renewPolicySchema), renewPolicy);

router
  .route("/:id/cancel")
  .put(authorize("ADMIN", "AGENT"), cancelPolicy);

export default router;
