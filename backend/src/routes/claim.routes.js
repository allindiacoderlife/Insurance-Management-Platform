import { Router } from "express";
import {
  getAllClaims,
  getClaimById,
  submitClaim,
  updateClaimStatus,
  deleteClaim,
} from "../controllers/claim.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  submitClaimSchema,
  updateClaimStatusSchema,
} from "../validations/claim.validation.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(getAllClaims)
  .post(validate(submitClaimSchema), submitClaim);

router
  .route("/:id")
  .get(getClaimById)
  .delete(authorize("ADMIN"), deleteClaim);

router
  .route("/:id/status")
  .put(authorize("ADMIN", "AGENT"), validate(updateClaimStatusSchema), updateClaimStatus);

export default router;
