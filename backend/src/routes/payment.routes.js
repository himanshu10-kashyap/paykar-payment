import express from "express";
import { generateCustomer, getPaymentById, getPayments, initiatePayment, verifyPayment } from "../controllers/payment.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = express.Router();


router.post("/initiate", initiatePayment);

router.get("/verify/:trxId", verifyPayment);

router.get("/generate-customer", generateCustomer);

router.get("/", authenticateAdmin, requirePermission("VIEW_PAYMENTS"), getPayments);

router.get("/:id", authenticateAdmin, requirePermission("VIEW_PAYMENT_DETAILS"), getPaymentById);

export default router;