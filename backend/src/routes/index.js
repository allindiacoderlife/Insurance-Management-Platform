import { Router } from "express";
import authRoutes from "./auth.routes.js";
import customerRoutes from "./customer.routes.js";
import policyRoutes from "./policy.routes.js";
import paymentRoutes from "./payment.routes.js";
import claimRoutes from "./claim.routes.js";
import documentRoutes from "./document.routes.js";
import reportRoutes from "./report.routes.js";
import agentRoutes from "./agent.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/policies", policyRoutes);
router.use("/payments", paymentRoutes);
router.use("/claims", claimRoutes);
router.use("/documents", documentRoutes);
router.use("/reports", reportRoutes);
router.use("/agents", agentRoutes);

export default router;
