import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "order_id",
    },

    merchantReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "merchant_reference",
    },

    idempotencyKey: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
      field: "idempotency_key",
    },

    // Paykar ref_trx
    paykarReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "paykar_reference",
    },

    // Paykar trx_id
    paykarTransactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "paykar_transaction_id",
    },

    utr: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    paykarGatewayOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "paykar_gateway_order_id",
    },

    sabpaisaPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "sabpaisa_payment_id",
    },

    sabpaisaTransactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "sabpaisa_transaction_id",
    },

    paymentMethod: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "payment_method",
    },

    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "customer_name",
    },

    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "customer_email",
    },

    customerMobile: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "customer_mobile",
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USD",
    },

    environment: {
      type: DataTypes.ENUM(
        "sandbox",
        "production"
      ),
      allowNull: false,
      defaultValue: "sandbox",
    },

    status: {
      type: DataTypes.ENUM(
        "CREATED",
        "INITIATED",
        "PENDING",
        "SUCCESS",
        "FAILED",
        "CANCELLED",
        "EXPIRED"
      ),
      allowNull: false,
      defaultValue: "CREATED",
    },

    paymentStatus: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "payment_status",
    },

    checkoutUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "checkout_url",
    },

    successRedirect: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "success_redirect",
    },

    failureUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "failure_url",
    },

    cancelRedirect: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cancel_redirect",
    },

    ipnUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "ipn_url",
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "paid_at",
    },

    webhookReceived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "webhook_received",
    },

    webhookReceivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "webhook_received_at",
    },

    webhookPayload: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "webhook_payload",
    },

    initiateResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "initiate_response",
    },

    verifyResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "verify_response",
    },

    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "failure_reason",
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    paykarWebhookId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "paykar_webhook_id",
    },

    webhookEnvironment: {
      type: DataTypes.ENUM(
        "sandbox",
        "production"
      ),
      allowNull: true,
      field: "webhook_environment",
    },

    webhookStatus: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "webhook_status",
    },

    vendorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "vendor_id",
    },

    vendorSlug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "vendor_slug",
    },
  },

  {
    tableName: "payments",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        unique: true,
        fields: ["order_id"],
      },

      {
        unique: true,
        fields: ["idempotency_key"],
      },

      {
        fields: ["paykar_reference"],
      },

      {
        fields: ["paykar_transaction_id"],
      },

      {
        fields: ["paykar_webhook_id"],
      },

      {
        fields: ["status"],
      },

      {
        fields: ["customer_email"],
      },

      {
        fields: ["vendor_id"],
      },

      {
        fields: ["created_at"],
      },

      {
        fields: ["vendor_id", "created_at"],
      },

      {
        fields: ["status", "created_at"],
      },
    ],
  }
);

export default Payment;