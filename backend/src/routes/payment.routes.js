import { Router } from "express";
import {
  getAllPayments,
  recordPayment,
  updatePaymentStatus,
} from "../controllers/payment.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  recordPaymentSchema,
  updatePaymentStatusSchema,
} from "../validations/payment.validation.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(getAllPayments)
  .post(validate(recordPaymentSchema), recordPayment);

router
  .route("/:id/status")
  .put(authorize("ADMIN", "AGENT"), validate(updatePaymentStatusSchema), updatePaymentStatus);

export default router;
