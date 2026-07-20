import { Router } from "express";
import {
  uploadDocument,
  getCustomerDocuments,
  downloadDocument,
  deleteDocument,
} from "../controllers/document.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/customer/:customerId", getCustomerDocuments);
router.get("/download/:id", downloadDocument);
router.delete("/:id", authorize("ADMIN", "AGENT"), deleteDocument);

export default router;
