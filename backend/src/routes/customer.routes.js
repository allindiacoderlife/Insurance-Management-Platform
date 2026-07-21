import { Router } from "express";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.validation.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = Router();

// Protect all customer routes with JWT authentication
router.use(authenticate);

router
  .route("/")
  .get(authorize("ADMIN", "AGENT"), cacheMiddleware("customers", 120), getAllCustomers)
  .post(authorize("ADMIN", "AGENT"), validate(createCustomerSchema), createCustomer);

router
  .route("/:id")
  .get(cacheMiddleware("customer_detail", 120), getCustomerById)
  .put(authorize("ADMIN", "AGENT"), validate(updateCustomerSchema), updateCustomer)
  .delete(authorize("ADMIN"), deleteCustomer);

export default router;
