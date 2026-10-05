import crypto from "crypto";
import Payment from "../models/Payment.js";

const EnvironmentMode = {
  SANDBOX: "sandbox",
  PRODUCTION: "production",
};

const getSecretForEnvironment = (environment) => {
  if (environment === EnvironmentMode.SANDBOX) {
    return process.env.PAYKAR_TEST_WEBHOOK_SECRET;
  }
  return process.env.PAYKAR_WEBHOOK_SECRET;
};

const verifySignature = (payload, signature, secret) => {
  if (!payload || !signature || !secret) {
    return false;
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const receivedSignature = signature.replace(/^sha256=/i, "").trim();

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
};

export const paykarWebhook = async (req, res) => {
  try {

    const environment = EnvironmentMode.PRODUCTION;

    const signature = req.headers["x-signature"];

    if (environment !== EnvironmentMode.SANDBOX && environment !== EnvironmentMode.PRODUCTION) {
      return res.status(400).json({
        success: false,
        error: "Invalid environment",
      });
    }

    const secret = getSecretForEnvironment(environment);

    if (!secret) {
      console.error(`Paykar webhook secret is not configured for ${environment}`);
      return res.status(500).json({
        success: false,
        error: "Webhook secret not configured",
      });
    }

    const isValidSignature = verifySignature(req.rawBody, signature, secret);

    if (!isValidSignature) {
      console.warn("Paykar webhook signature verification failed", {
        environment,
      });

      return res.status(401).json({
        success: false,
        error: "Invalid signature",
      });
    }

    const payload = req.body;

    const webhookData = payload?.data || {};
    const refTrx = webhookData?.ref_trx;
    const webhookStatus = payload?.status;
    const message = payload?.message;
    const timestamp = payload?.timestamp;

    if (!refTrx) {
      return res.status(400).json({
        success: false,
        error: "ref_trx is required",
      });
    }

    const payment = await Payment.findOne({
      where: {
        paykarReference: refTrx,
      },
    });

    if (!payment) {
      return res.status(200).json({
        success: false,
        status: "ignored",
        message: "Payment not found",
      });
    }

    let paymentStatus = "PENDING";
    let paidAt = payment.paidAt;

    if (webhookStatus === "completed" || webhookStatus === "success") {
      paymentStatus = "SUCCESS";
      if (!paidAt) {
        paidAt = new Date();
      }
    }

    else if (webhookStatus === "failed" || webhookStatus === "failure") {
      paymentStatus = "FAILED";
    }
    else if (webhookStatus === "cancelled" || webhookStatus === "canceled") {
      paymentStatus = "CANCELLED";
    }
    else if (webhookStatus === "expired") {
      paymentStatus = "EXPIRED";
    }

    await payment.update({
      paykarTransactionId: payment.paykarTransactionId || webhookData?.trx_id || null,
      paymentStatus: webhookStatus || null,
      status: paymentStatus,
      paidAt,
      webhookReceived: true,
      webhookReceivedAt: new Date(),
      webhookPayload: payload,
      webhookEnvironment: environment,
      webhookStatus: webhookStatus || null,
      failureReason: paymentStatus === "FAILED" ? message || "Payment failed" : null,
    });

    if (paymentStatus === "SUCCESS") {
    }

    return res.status(200).json({ success: true, status: "processed" });

  } catch (error) {
    console.error("Paykar webhook processing error:", error);
    return res.status(500).json({
      success: false,
      error: "Processing failed",
    });
  }
};