import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  FileJson,
  Hash,
  Info,
  User,
  WalletCards,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPaymentById } from "../../services/paymentApi";

import Loader from "../../components/common/Loader";

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Payment
  |--------------------------------------------------------------------------
  */

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPaymentById(id);

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to load payment"
        );
      }

      setPayment(response.data);
    } catch (error) {
      console.error(
        "Load payment details error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load payment"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Copy
  |--------------------------------------------------------------------------
  */

  const copyValue = async (
    value,
    field
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopied(field);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (
    amount,
    currency = "INR"
  ) => {
    const value = Number(amount || 0);

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(value);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "SUCCESS":
      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "FAILED":
      case "FAILURE":
        return "border-red-200 bg-red-50 text-red-700";

      case "CANCELLED":
      case "CANCELED":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "EXPIRED":
        return "border-slate-200 bg-slate-100 text-slate-700";

      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  };

  const getWebhookPayload = () => {
    if (!payment?.webhookPayload) {
      return null;
    }

    try {
      return JSON.stringify(
        payment.webhookPayload,
        null,
        2
      );
    } catch {
      return String(
        payment.webhookPayload
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Loader text="Loading payment details..." />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() =>
            navigate("/payments")
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />

          Back to Payments
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <XCircle
            size={42}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-bold text-red-800">
            Unable to load payment
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPayment}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  const webhookPayload =
    getWebhookPayload();

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/payments")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />

            Back to Payments
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Payment Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Complete payment and gateway
            transaction information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold ${getStatusClass(
              payment.status
            )}`}
          >
            {payment.status ||
              "UNKNOWN"}
          </span>
        </div>
      </div>

      {/* Main Summary */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Amount */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <WalletCards
                size={21}
              />
            </div>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Amount
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(
              payment.amount,
              payment.currency
            )}
          </p>
        </div>

        {/* Payment Status */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2
              size={21}
            />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Payment Status
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {payment.paymentStatus ||
              payment.status ||
              "-"}
          </p>
        </div>

        {/* Payment Method */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CreditCard
              size={21}
            />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Payment Method
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {payment.paymentMethod ||
              "-"}
          </p>
        </div>

        {/* Created */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Clock3 size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Created
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatDate(
              payment.createdAt ||
                payment.created_at
            )}
          </p>
        </div>
      </div>

      {/* Transaction Information */}

      <Section
        title="Transaction Information"
        icon={<Hash size={19} />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DetailItem
            label="Payment ID"
            value={payment.id}
            copyKey="paymentId"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="Order ID"
            value={payment.orderId}
            copyKey="orderId"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="Merchant Reference"
            value={
              payment.merchantReference
            }
            copyKey="merchantReference"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="Paykar Reference"
            value={
              payment.paykarReference
            }
            copyKey="paykarReference"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="Paykar Transaction ID"
            value={
              payment.paykarTransactionId
            }
            copyKey="paykarTransactionId"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="UTR"
            value={payment.utr}
            copyKey="utr"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="Paykar Gateway Order ID"
            value={
              payment.paykarGatewayOrderId
            }
            copyKey="paykarGatewayOrderId"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="SabPaisa Payment ID"
            value={
              payment.sabpaisaPaymentId
            }
            copyKey="sabpaisaPaymentId"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="SabPaisa Transaction ID"
            value={
              payment.sabpaisaTransactionId
            }
            copyKey="sabpaisaTransactionId"
            copied={copied}
            onCopy={copyValue}
          />

          <DetailItem
            label="Currency"
            value={payment.currency}
          />

          <DetailItem
            label="Environment"
            value={payment.environment}
          />

          <DetailItem
            label="Payment Status"
            value={payment.paymentStatus}
          />
        </div>
      </Section>

      {/* Vendor */}

      <Section
        title="Vendor Information"
        icon={<WalletCards size={19} />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Vendor ID"
            value={
              payment.vendor?.id ||
              payment.vendorId
            }
          />

          <DetailItem
            label="Company Name"
            value={
              payment.vendor
                ?.companyName ||
              "-"
            }
          />

          <DetailItem
            label="Vendor Slug"
            value={
              payment.vendor?.slug ||
              payment.vendorSlug ||
              "-"
            }
          />

          <DetailItem
            label="Vendor Status"
            value={
              payment.vendor
                ? payment.vendor.isActive
                  ? "Active"
                  : "Inactive"
                : "-"
            }
          />
        </div>
      </Section>

      {/* Customer */}

      <Section
        title="Customer Information"
        icon={<User size={19} />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Customer Name"
            value={
              payment.customerName
            }
          />

          <DetailItem
            label="Email"
            value={
              payment.customerEmail
            }
          />

          <DetailItem
            label="Mobile"
            value={
              payment.customerMobile
            }
          />
        </div>
      </Section>

      {/* Redirect URLs */}

      <Section
        title="Payment URLs"
        icon={
          <ExternalLink size={19} />
        }
      >
        <div className="space-y-4">
          <UrlItem
            label="Checkout URL"
            value={
              payment.checkoutUrl
            }
          />

          <UrlItem
            label="Success Redirect"
            value={
              payment.successRedirect
            }
          />

          <UrlItem
            label="Failure URL"
            value={
              payment.failureUrl
            }
          />

          <UrlItem
            label="Cancel Redirect"
            value={
              payment.cancelRedirect
            }
          />

          <UrlItem
            label="IPN / Webhook URL"
            value={
              payment.ipnUrl
            }
          />
        </div>
      </Section>

      {/* Dates */}

      <Section
        title="Payment Timeline"
        icon={<Clock3 size={19} />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Created At"
            value={formatDate(
              payment.createdAt ||
                payment.created_at
            )}
          />

          <DetailItem
            label="Updated At"
            value={formatDate(
              payment.updatedAt ||
                payment.updated_at
            )}
          />

          <DetailItem
            label="Paid At"
            value={formatDate(
              payment.paidAt ||
                payment.paid_at
            )}
          />

          <DetailItem
            label="Webhook Received At"
            value={formatDate(
              payment.webhookReceivedAt ||
                payment.webhook_received_at
            )}
          />

          <DetailItem
            label="Webhook Received"
            value={
              payment.webhookReceived
                ? "Yes"
                : "No"
            }
          />

          <DetailItem
            label="Webhook Environment"
            value={
              payment.webhookEnvironment ||
              "-"
            }
          />

          <DetailItem
            label="Webhook Status"
            value={
              payment.webhookStatus ||
              "-"
            }
          />
        </div>
      </Section>

      {/* Description / Failure */}

      <Section
        title="Additional Information"
        icon={<Info size={19} />}
      >
        <div className="space-y-5">
          <DetailItem
            label="Description"
            value={
              payment.description ||
              payment.metadata
                ?.description ||
              "-"
            }
            full
          />

          <DetailItem
            label="Failure Reason"
            value={
              payment.failureReason ||
              "-"
            }
            full
          />
        </div>
      </Section>

      {/* Webhook Payload */}

      {webhookPayload && (
        <Section
          title="Webhook Payload"
          icon={
            <FileJson size={19} />
          }
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paykar Webhook Data
              </span>

              <button
                type="button"
                onClick={() =>
                  copyValue(
                    webhookPayload,
                    "webhookPayload"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                <Copy size={14} />

                {copied ===
                "webhookPayload"
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="max-h-[600px] overflow-auto p-5 text-xs leading-6 text-slate-300">
              {webhookPayload}
            </pre>
          </div>
        </Section>
      )}

      {/* Initiate Response */}

      {payment.initiateResponse && (
        <JsonSection
          title="Initiate Response"
          data={
            payment.initiateResponse
          }
          copyKey="initiateResponse"
          copied={copied}
          onCopy={copyValue}
        />
      )}

      {/* Verify Response */}

      {payment.verifyResponse && (
        <JsonSection
          title="Verify Response"
          data={
            payment.verifyResponse
          }
          copyKey="verifyResponse"
          copied={copied}
          onCopy={copyValue}
        />
      )}

      {/* Metadata */}

      {payment.metadata && (
        <JsonSection
          title="Metadata"
          data={payment.metadata}
          copyKey="metadata"
          copied={copied}
          onCopy={copyValue}
        />
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Section
|--------------------------------------------------------------------------
*/

const Section = ({
  title,
  icon,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
};

/*
|--------------------------------------------------------------------------
| Detail Item
|--------------------------------------------------------------------------
*/

const DetailItem = ({
  label,
  value,
  copyKey,
  copied,
  onCopy,
  full = false,
}) => {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "-"
      : String(value);

  return (
    <div
      className={
        full
          ? "w-full"
          : ""
      }
    >
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex min-h-[42px] items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="min-w-0 break-all text-sm font-semibold text-slate-800">
          {displayValue}
        </p>

        {copyKey &&
          onCopy &&
          value && (
            <button
              type="button"
              onClick={() =>
                onCopy(
                  value,
                  copyKey
                )
              }
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-blue-600"
              title="Copy"
            >
              <Copy size={15} />
            </button>
          )}

        {copyKey &&
          copied === copyKey && (
            <span className="shrink-0 text-xs font-semibold text-emerald-600">
              Copied
            </span>
          )}
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| URL Item
|--------------------------------------------------------------------------
*/

const UrlItem = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
        <p className="min-w-0 flex-1 break-all text-sm text-slate-700">
          {value || "-"}
        </p>

        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-blue-600"
          >
            <ExternalLink
              size={16}
            />
          </a>
        )}
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| JSON Section
|--------------------------------------------------------------------------
*/

const JsonSection = ({
  title,
  data,
  copyKey,
  copied,
  onCopy,
}) => {
  let json = "";

  try {
    json = JSON.stringify(
      data,
      null,
      2
    );
  } catch {
    json = String(data);
  }

  return (
    <Section
      title={title}
      icon={<FileJson size={19} />}
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            JSON
          </span>

          <button
            type="button"
            onClick={() =>
              onCopy(
                json,
                copyKey
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <Copy size={14} />

            {copied === copyKey
              ? "Copied"
              : "Copy"}
          </button>
        </div>

        <pre className="max-h-[500px] overflow-auto p-5 text-xs leading-6 text-slate-300">
          {json}
        </pre>
      </div>
    </Section>
  );
};

export default PaymentDetails;