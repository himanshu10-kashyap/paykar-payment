import express from "express";
import { generateCustomer, initiatePayment, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();


router.post("/initiate", initiatePayment);

router.get("/verify/:trxId", verifyPayment);

router.get("/generate-customer", generateCustomer);

export default router;