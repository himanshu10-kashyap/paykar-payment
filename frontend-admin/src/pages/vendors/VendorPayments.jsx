import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  IndianRupee,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { getVendorPayments } from "../../services/vendorApi";

import Loader from "../../components/common/Loader";

const VendorPayments = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getVendorPayments(id);

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load vendor payments."
          );
        }

        setVendor(response.data?.vendor || null);

        setPayments(
          response.data?.payments || []
        );
      } catch (err) {
        console.error(
          "Get vendor payments error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load vendor payments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [id]);

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
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
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-600";

      case "FAILED":
        return "bg-red-50 text-red-600";

      case "CANCELLED":
        return "bg-orange-50 text-orange-600";

      case "EXPIRED":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-yellow-50 text-yellow-600";
    }
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/vendors")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Vendor Payments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {vendor?.companyName || "Vendor"} payment history.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[350px] items-center justify-center">
          <Loader text="Loading payments..." />
        </div>
      ) : (
        <>
          {/* Summary */}

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Total Payments
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard size={19} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {payments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Successful
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <IndianRupee size={19} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {
                  payments.filter(
                    (payment) =>
                      payment.status === "SUCCESS"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Successful Amount
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IndianRupee size={19} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatAmount(
                  payments
                    .filter(
                      (payment) =>
                        payment.status === "SUCCESS"
                    )
                    .reduce(
                      (sum, payment) =>
                        sum +
                        Number(
                          payment.amount || 0
                        ),
                      0
                    )
                )}
              </p>
            </div>
          </div>

          {/* Payments */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {payments.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <CreditCard
                  size={30}
                  className="text-slate-300"
                />

                <h3 className="mt-3 font-bold text-slate-700">
                  No payments found
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  This vendor has no payment records yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Order
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Transaction
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {payment.orderId || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {payment.paykarReference || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {payment.customerName || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {payment.customerEmail || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-800">
                            {formatAmount(
                              payment.amount
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              payment.status
                            )}`}
                          >
                            {payment.status ||
                              "PENDING"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[180px] truncate text-sm text-slate-600">
                            {payment.paykarTransactionId ||
                              "-"}
                          </p>

                          {payment.utr && (
                            <p className="mt-1 text-xs text-slate-400">
                              UTR: {payment.utr}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar size={15} />

                            {formatDate(
                              payment.createdAt
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorPayments;