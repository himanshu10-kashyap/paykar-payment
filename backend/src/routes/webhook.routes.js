import express from "express";
import { paykarWebhook } from "../controllers/webhook.controller.js";


const router = express.Router();

router.post("/paykar", paykarWebhook);

export default router;