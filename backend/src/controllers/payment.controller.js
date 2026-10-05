import axios from "axios";
import Payment from "../models/Payment.js";
import Vendor from "../models/Vendor.js";
import { Op } from "sequelize";

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
      vendorSlug,
    } = req.body;

    // ------------------------------------------------
    // Validate required fields
    // ------------------------------------------------

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

    if (!vendorSlug) {
      return res.status(400).json({
        success: false,
        message: "vendorSlug is required",
      });
    }


    // ------------------------------------------------
    // Find active vendor
    // ------------------------------------------------

    const vendor = await Vendor.findOne({
      where: {
        slug: vendorSlug,
        isActive: true,
      },
    });


    if (!vendor) {
      return res.status(404).json({
        success: false,
        message:
          "Payment vendor not found or inactive",
      });
    }


    // ------------------------------------------------
    // Debug vendor
    // ------------------------------------------------

    console.log(
      "Payment vendor resolved:",
      {
        vendorId: vendor.id,
        vendorSlug: vendor.slug,
        companyName: vendor.companyName,
        isActive: vendor.isActive,
      }
    );


    // ------------------------------------------------
    // Make sure vendor ID exists
    // ------------------------------------------------

    if (!vendor.id) {
      return res.status(500).json({
        success: false,
        message:
          "Vendor ID could not be resolved",
      });
    }


    // ------------------------------------------------
    // Webhook URL
    // ------------------------------------------------

    const webhookUrl =
      process.env.PAYKAR_WEBHOOK_URL;


    if (!webhookUrl) {
      return res.status(500).json({
        success: false,
        message:
          "PAYKAR_WEBHOOK_URL is not configured",
      });
    }


    // ------------------------------------------------
    // Idempotency check
    // ------------------------------------------------

    if (idempotencyKey) {

      const existingPayment =
        await Payment.findOne({
          where: {
            idempotencyKey,
          },
        });


      if (existingPayment) {

        return res.status(200).json({
          success: true,
          message:
            "Payment already initiated",
          data: existingPayment,
        });

      }

    }


    // ------------------------------------------------
    // Order check
    // ------------------------------------------------

    const existingOrder =
      await Payment.findOne({
        where: {
          orderId,
        },
      });


    if (existingOrder) {

      return res.status(409).json({
        success: false,
        message:
          "Payment already exists for this order",
        data: existingOrder,
      });

    }


    // ------------------------------------------------
    // Reference
    // ------------------------------------------------

    const refTrx = orderId;


    // ------------------------------------------------
    // Create Payment
    // ------------------------------------------------

    let payment;

    try {

      payment = await Payment.create({

        orderId,

        /*
         * IMPORTANT
         *
         * This must exist in vendors.id
         */
        vendorId: vendor.id,

        vendorSlug: vendor.slug,

        merchantReference: refTrx,

        idempotencyKey:
          idempotencyKey || null,

        customerName,

        customerEmail,

        customerMobile,

        amount,

        currency,

        environment:
          PAYKAR_ENVIRONMENT,

        status: "CREATED",

        successRedirect,

        failureUrl,

        cancelRedirect,

        ipnUrl: webhookUrl,

        metadata:
          metadata || null,

      });

    } catch (dbError) {

      console.error(
        "Payment database creation error:",
        dbError
      );


      // Foreign key error
      if (
        dbError?.name ===
          "SequelizeForeignKeyConstraintError" ||
        dbError?.parent?.code ===
          "ER_NO_REFERENCED_ROW_2"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid vendor. Vendor ID does not exist in the vendors table.",
          vendor: {
            id: vendor.id,
            slug: vendor.slug,
          },
        });

      }


      throw dbError;

    }


    // ------------------------------------------------
    // Paykar payment payload
    // ------------------------------------------------

    const paymentData = {

      payment_amount:
        Number(amount),

      currency_code:
        currency,

      ref_trx:
        refTrx,

      description:
        description ||
        `Payment for order ${orderId}`,

      success_redirect:
        successRedirect,

      failure_url:
        failureUrl,

      cancel_redirect:
        cancelRedirect,

      ipn_url:
        webhookUrl,

      customer_name:
        customerName,

      customer_email:
        customerEmail,

      customer_mobile:
        customerMobile,

      allow_payment_methods:
        allowPaymentMethods ||
        "sabpaisa",
    };


    // ------------------------------------------------
    // Initiate Paykar
    // ------------------------------------------------

    let response;


    try {

      response =
        await axios.post(
          `${PAYKAR_BASE_URL}/initiate-payment`,
          paymentData,
          {
            headers:
              getPaykarHeaders(),

            timeout: 30000,

            validateStatus:
              () => true,
          }
        );

    } catch (error) {

      const errorData =
        error.response?.data || {
          error: error.message,
        };


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


      return res.status(
        error.response?.status || 500
      ).json({

        success: false,

        message:
          typeof errorData === "string"
            ? errorData
            : errorData?.error ||
              errorData?.message ||
              "Paykar payment initiation failed",

        data:
          errorData,

      });

    }


    // ------------------------------------------------
    // Paykar HTTP error
    // ------------------------------------------------

    if (
      response.status < 200 ||
      response.status >= 300
    ) {

      const errorData =
        response.data;


      const failureReason =
        typeof errorData === "string"
          ? errorData
          : errorData?.error ||
            errorData?.message ||
            `Paykar returned HTTP ${response.status}`;


      await payment.update({

        status: "FAILED",

        failureReason,

        initiateResponse:
          errorData,

      });


      return res.status(
        response.status
      ).json({

        success: false,

        message:
          "Paykar payment initiation failed",

        data:
          errorData,

      });

    }


    // ------------------------------------------------
    // Paykar response
    // ------------------------------------------------

    const paykarResponse =
      response.data;


    const paykarInfo =
      paykarResponse?.info || {};


    const paymentUrl =
      paykarResponse?.payment_url ||
      null;


    // ------------------------------------------------
    // Payment URL missing
    // ------------------------------------------------

    if (!paymentUrl) {

      await payment.update({

        status: "FAILED",

        paymentStatus:
          paykarResponse?.status ||
          "FAILED",

        initiateResponse:
          paykarResponse,

        failureReason:
          "Paykar did not return payment_url",

      });


      return res.status(502).json({

        success: false,

        message:
          "Paykar did not return payment URL",

        data:
          paykarResponse,

      });

    }


    // ------------------------------------------------
    // Update Payment
    // ------------------------------------------------

    await payment.update({

      status: "INITIATED",

      paymentStatus:
        paykarResponse?.status ||
        "INITIATED",

      checkoutUrl:
        paymentUrl,

      paykarReference:
        paykarInfo?.ref_trx ||
        refTrx,

      merchantReference:
        paykarInfo?.ref_trx ||
        refTrx,

      initiateResponse:
        paykarResponse,

      failureReason:
        null,

    });


    // ------------------------------------------------
    // Response
    // ------------------------------------------------

    return res.status(200).json({

      success: true,

      message:
        "Payment initiated successfully",

      data: {

        paymentId:
          payment.id,

        orderId:
          payment.orderId,

        vendorId:
          payment.vendorId,

        vendorSlug:
          payment.vendorSlug,

        ref_trx:
          paykarInfo?.ref_trx ||
          refTrx,

        payment_url:
          paymentUrl,

        status:
          payment.status,

        checkoutUrl:
          payment.checkoutUrl,

      },

      paykarResponse,

    });

  } catch (error) {

    console.error(
      "Initiate payment error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

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

let mobilePrefixIndex = 0;

const mobilePrefixes = ["9", "8", "7", "6"];


const generateUniqueCustomer = () => {

  let customerName;

  do {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    customerName = `${firstName} ${lastName}`;
  } while (
    usedCustomers.has(customerName)
  );

  usedCustomers.add(customerName);

  let mobile;

  do {
    const prefix = mobilePrefixes[mobilePrefixIndex % mobilePrefixes.length];
    mobilePrefixIndex++;
    const remainingDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    mobile = prefix + remainingDigits;
  } while (
    usedNumbers.has(mobile)
  );

  usedNumbers.add(mobile);


  const emailName = customerName.toLowerCase().replace(/\s+/g, ".");


  return {
    customerName,
    customerEmail: `${emailName}@gmail.com`,
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

export const getPayments = async (req, res) => {

  try {

    const {
      page = 1,
      limit = 10,
      vendorId,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      paymentMethod,
      currency,
      search,
      minAmount,
      maxAmount,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;


    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const where = {};


    if (vendorId) {
      const parsedVendorId = Number.parseInt(vendorId, 10);

      if (!Number.isInteger(parsedVendorId) || parsedVendorId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid vendorId",
        });

      }

      where.vendorId = parsedVendorId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }


    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (currency) {
      where.currency = currency.toUpperCase();
    }

    if (dateFrom || dateTo) {

      where.createdAt = {};

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid dateFrom",
          });
        }
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt[Op.gte] = fromDate;
      }


      if (dateTo) {
        const toDate = new Date(dateTo);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid dateTo",
          });
        }
        toDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = toDate;
      }
    }



    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        const minimum = Number(minAmount);
        if (!Number.isFinite(minimum) || minimum < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minAmount",
          });
        }
        where.amount[Op.gte] = minimum;
      }


      if (maxAmount !== undefined) {
        const maximum = Number(maxAmount);
        if (!Number.isFinite(maximum) || maximum < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maxAmount",
          });

        }
        where.amount[Op.lte] = maximum;
      }

    }

    if (search) {

      const searchValue = search.trim();

      if (searchValue) {

        where[Op.or] = [
          {
            orderId: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            merchantReference: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            paykarReference: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            paykarTransactionId: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            utr: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            customerName: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            customerEmail: {
              [Op.like]: `%${searchValue}%`,
            },
          },
          {
            customerMobile: {
              [Op.like]: `%${searchValue}%`,
            },
          },
        ];
      }
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "amount",
      "status",
      "paidAt",
      "customerName",
    ];


    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const finalSortOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";


    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "companyName",
            "slug",
            "isActive",
          ],
        },
      ],

      order: [
  [
    finalSortBy === "createdAt"
      ? "created_at"
      : finalSortBy === "updatedAt"
      ? "updated_at"
      : finalSortBy === "paidAt"
      ? "paid_at"
      : finalSortBy,
    finalSortOrder,
  ],
],
      limit: limitNumber,
      offset,
      distinct: true,
    });

    console.log("Get payments success:", {
      count,
      rows,
    });

    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
      filters: {
        vendorId: vendorId || null,
        status: status || null,
        paymentStatus: paymentStatus || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        paymentMethod: paymentMethod || null,
        currency: currency || null,
        // environment: environment || null,
        search: search || null,
        minAmount: minAmount || null,
        maxAmount: maxAmount || null,
      },
    });

  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentId = Number.parseInt(id, 10);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "companyName",
            "slug",
            "isActive",
          ],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(
      "Get payment by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};