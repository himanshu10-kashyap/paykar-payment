import axios from "axios";
import Payment from "../models/Payment.js";

const PAYKAR_BASE_URL = process.env.PAYKAR_BASE_URL || "https://paykar.in/gateway/api/v1";
const PAYKAR_ENVIRONMENT = process.env.PAYKAR_ENVIRONMENT || "production";
const PAYKAR_MERCHANT_ID = process.env.PAYKAR_MERCHANT_ID;
const PAYKAR_API_KEY = process.env.PAYKAR_API_KEY;


const getPaykarHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Environment": PAYKAR_ENVIRONMENT,
  "X-Merchant-Key": PAYKAR_MERCHANT_ID,
  "X-API-Key": PAYKAR_API_KEY,
});


export const initiatePayment = async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerMobile,
      amount,
      currency = "INR",
      description,
      successRedirect,
      failureUrl,
      cancelRedirect,
      allowPaymentMethods,
      idempotencyKey,
      metadata,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "customerName is required",
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "customerEmail is required",
      });
    }

    if (!customerMobile) {
      return res.status(400).json({
        success: false,
        message: "customerMobile is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!successRedirect) {
      return res.status(400).json({
        success: false,
        message: "successRedirect is required",
      });
    }

    if (!failureUrl) {
      return res.status(400).json({
        success: false,
        message: "failureUrl is required",
      });
    }

    if (!cancelRedirect) {
      return res.status(400).json({
        success: false,
        message: "cancelRedirect is required",
      });
    }

    const webhookUrl = process.env.PAYKAR_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({
        success: false,
        message: "PAYKAR_WEBHOOK_URL is not configured",
      });
    }


    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({
        where: {
          idempotencyKey,
        },
      });

      if (existingPayment) {
        return res.status(200).json({
          success: true,
          message: "Payment already initiated",
          data: existingPayment,
        });
      }
    }

    const existingOrder = await Payment.findOne({
      where: {
        orderId,
      },
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Payment already exists for this order",
        data: existingOrder,
      });
    }

    const refTrx = orderId;

    const payment = await Payment.create({
      orderId,
      merchantReference: refTrx,
      idempotencyKey: idempotencyKey || null,
      customerName,
      customerEmail,
      customerMobile,
      amount,
      currency,
      environment: PAYKAR_ENVIRONMENT,
      status: "CREATED",
      successRedirect,
      failureUrl,
      cancelRedirect,
      ipnUrl: webhookUrl,
      metadata: metadata || null,
    });

    const paymentData = {
      payment_amount: Number(amount),
      currency_code: currency,
      ref_trx: refTrx,
      description: description || `Payment for order ${orderId}`,

      success_redirect: successRedirect,
      failure_url: failureUrl,
      cancel_redirect: cancelRedirect,
      ipn_url: webhookUrl,

      customer_name: customerName,
      customer_email: customerEmail,
      customer_mobile: customerMobile,

      allow_payment_methods: "sabpaisa"
    };

    let response;

    try {
      response = await axios.post(
        `${PAYKAR_BASE_URL}/initiate-payment`,
        paymentData,
        {
          headers: getPaykarHeaders(),
          timeout: 30000,
          validateStatus: () => true,
        }
      );

    } catch (error) {
      const errorData = error.response?.data || { error: error.message };

      await payment.update({
        status: "FAILED",
        failureReason:
          typeof errorData === "string"
            ? errorData
            : errorData?.error ||
            errorData?.message ||
            error.message ||
            "Paykar payment initiation failed",
        initiateResponse:
          errorData,
      });


      return res.status(error.response?.status || 500).json({
        success: false,
        message:
          typeof errorData === "string"
            ? errorData
            : errorData?.error ||
            errorData?.message ||
            "Paykar payment initiation failed",

        data: errorData,
      });
    }

    if (response.status < 200 || response.status >= 300) {

      const errorData = response.data;
      const failureReason =
        typeof errorData === "string"
          ? errorData
          : errorData?.error ||
          errorData?.message ||
          `Paykar returned HTTP ${response.status}`;

      await payment.update({
        status: "FAILED",
        failureReason,
        initiateResponse: errorData,
      });

      return res.status(response.status).json({
        success: false,
        message: "Paykar payment initiation failed",
        data: errorData,
      });
    }

    const paykarResponse = response.data;

    const paykarInfo = paykarResponse?.info || {};

    const paymentUrl = paykarResponse?.payment_url || null;

    if (!paymentUrl) {
      await payment.update({
        status: "FAILED",
        paymentStatus: paykarResponse?.status || "FAILED",
        initiateResponse: paykarResponse,
        failureReason: "Paykar did not return payment_url",
      });


      return res.status(502).json({
        success: false,
        message: "Paykar did not return payment URL",
        data: paykarResponse,
      });
    }

    await payment.update({
      status: "INITIATED",
      paymentStatus: paykarResponse?.status || "INITIATED",
      checkoutUrl: paymentUrl,
      paykarReference: paykarInfo?.ref_trx || refTrx,
      merchantReference: paykarInfo?.ref_trx || refTrx,
      initiateResponse: paykarResponse,
      failureReason: null,
    });

    return res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        ref_trx: paykarInfo?.ref_trx || refTrx,
        payment_url: paymentUrl,
        status: payment.status,
        checkoutUrl: payment.checkoutUrl,
      },
      paykarResponse,
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { trxId } = req.params;

    if (!trxId) {
      return res.status(400).json({
        success: false,
        message: "trxId is required",
      });
    }

    const payment = await Payment.findOne({
      where: {
        paykarReference: trxId,
      },
    });


    let response;

    try {
      response = await axios.get(`${PAYKAR_BASE_URL}/verify-payment/${encodeURIComponent(trxId)}`,
        {
          headers: getPaykarHeaders(),
          timeout: 30000,
        }
      );
    } catch (error) {
      const errorData =
        error.response?.data || {
          error: error.message,
        };

      if (payment) {
        await payment.update({
          status: "FAILED",
          failureReason:
            errorData?.error ||
            errorData?.message ||
            "Payment verification failed",
          verifyResponse: errorData,
        });
      }


      return res.status(
        error.response?.status || 500
      ).json({
        success: false,
        message: errorData?.error || errorData?.message || "Payment verification failed",
        data: errorData,
      });
    }

    const verifyData = response.data;

    const isSuccessful = verifyData?.status === "success";

    if (payment) {
      await payment.update({
        paykarTransactionId: verifyData?.trx_id || null,
        paykarReference: payment.paykarReference || trxId,
        paymentStatus: verifyData?.status || null,
        status: isSuccessful ? "SUCCESS" : "PENDING",
        verifyResponse: verifyData,
        paidAt: isSuccessful ? new Date() : payment.paidAt,
        failureReason: !isSuccessful ? verifyData?.message || "Payment not completed" : null,
      });
    }

    if (isSuccessful) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          paymentId: payment?.id || null,
          orderId: payment?.orderId || null,
          trx_id: verifyData?.trx_id,
          ref_trx: payment?.paykarReference || trxId,
          trxId,
          amount: verifyData?.amount,
          fee: verifyData?.fee,
          net_amount: verifyData?.net_amount,
          currency: verifyData?.currency,
          customer: verifyData?.customer,
          description: verifyData?.description,
          status: verifyData?.status,
          paidAt: payment?.paidAt || new Date(),
        },
        paykarResponse: verifyData,
      });
    }

    return res.status(200).json({
      success: false,
      message: verifyData?.message || "Payment not completed",
      data: {
        paymentId: payment?.id || null,
        orderId: payment?.orderId || null,
        ref_trx: payment?.paykarReference || trxId,
        status: verifyData?.status || "pending",
      },
      paykarResponse: verifyData,
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const usedCustomers = new Set();

const firstNames = [
  "Aarav",
  "Aditi",
  "Aditya",
  "Akash",
  "Aman",
  "Amit",
  "Ananya",
  "Anjali",
  "Arjun",
  "Aryan",
  "Deepak",
  "Diya",
  "Gaurav",
  "Isha",
  "Karan",
  "Kavya",
  "Manish",
  "Meera",
  "Neha",
  "Nikhil",
  "Pooja",
  "Priya",
  "Rahul",
  "Raj",
  "Riya",
  "Rohit",
  "Sahil",
  "Sakshi",
  "Sandeep",
  "Shivam",
  "Sneha",
  "Sonam",
  "Sumit",
  "Tanvi",
  "Varun",
  "Vikas",
  "Vivek"
];

const lastNames = [
  "Sharma",
  "Kumar",
  "Singh",
  "Choudhary",
  "Gupta",
  "Verma",
  "Yadav",
  "Mishra",
  "Agarwal",
  "Patel",
  "Mehta",
  "Shah",
  "Jain",
  "Das",
  "Roy",
  "Sinha",
  "Sarkar",
  "Ghosh",
  "Banerjee",
  "Chatterjee",
  "Dutta",
  "Sen",
  "Malhotra",
  "Kapoor",
  "Bose",
  "Nair",
  "Reddy",
  "Iyer",
  "Pillai",
  "Menon"
];

const usedNumbers = new Set();

const generateUniqueCustomer = () => {
  let customerName;

  do {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    customerName = `${firstName} ${lastName}`;
  } while (usedCustomers.has(customerName));
  usedCustomers.add(customerName);
  let mobile;

  do {
    mobile = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();

  } while (usedNumbers.has(mobile));

  usedNumbers.add(mobile);

  const emailName = customerName
    .toLowerCase()
    .replace(/\s+/g, ".");

  return {
    customerName,
    customerEmail: `${emailName}@example.com`,
    customerMobile: mobile,
  };
};


export const generateCustomer = async (req, res) => {
  try {
    const customer = generateUniqueCustomer();

    return res.status(200).json({
      success: true,
      data: customer,
    });

  } catch (error) {
    console.error(
      "Generate Customer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate customer",
    });
  }
};