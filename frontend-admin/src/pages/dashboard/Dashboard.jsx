import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  RefreshCw,
  Store,
  XCircle,
} from "lucide-react";

import { getDashboard } from "../../services/dashboardApi";

import Loader from "../../components/common/Loader";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(
    Number(value || 0)
  );
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "SUCCESS":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "border-amber-100 bg-amber-50 text-amber-700";

    case "FAILED":
      return "border-red-100 bg-red-50 text-red-700";

    case "CANCELLED":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "EXPIRED":
      return "border-orange-100 bg-orange-50 text-orange-700";

    default:
      return "border-blue-100 bg-blue-50 text-blue-700";
  }
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getDashboard();

        if (!response?.success) {
          throw new Error(
            response?.message ||
            "Failed to load dashboard"
          );
        }

        setDashboard(response.data);
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const maxChartAmount = useMemo(() => {
    if (!dashboard?.last7Days?.length) {
      return 1;
    }

    const amounts = dashboard.last7Days.map(
      (item) => Number(item.amount || 0)
    );

    return Math.max(...amounts, 1);
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader
          size="lg"
          text="Loading dashboard..."
        />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <h3 className="font-bold text-red-800">
              Unable to load dashboard
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const today = dashboard?.today || {};
  const vendors = dashboard?.vendors || {};

  const recentPayments =
    dashboard?.recentPayments || [];

  const last7Days =
    dashboard?.last7Days || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor payments, vendors and
            business activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* PAYMENT STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Payments"
          value={formatNumber(
            overview.totalPayments
          )}
          subtitle="All payment attempts"
          icon={CreditCard}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Successful Payments"
          value={formatNumber(
            overview.successfulPayments
          )}
          subtitle={formatCurrency(
            overview.successfulAmount
          )}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Pending Payments"
          value={formatNumber(
            overview.pendingPayments
          )}
          subtitle={formatCurrency(
            overview.pendingAmount
          )}
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Failed Payments"
          value={formatNumber(
            overview.failedPayments
          )}
          subtitle={formatCurrency(
            overview.failedAmount
          )}
          icon={XCircle}
          iconClass="bg-red-50 text-red-600"
        />
      </div>

      {/* SECONDARY STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Payment Amount"
          value={formatCurrency(
            overview.totalAmount
          )}
          subtitle="All payment attempts"
          icon={IndianRupee}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Today's Payments"
          value={formatNumber(
            today.payments
          )}
          subtitle={`${formatCurrency(
            today.amount
          )} today`}
          icon={Activity}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Today's Successful"
          value={formatNumber(
            today.successfulPayments
          )}
          subtitle={formatCurrency(
            today.successfulAmount
          )}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Total Vendors"
          value={formatNumber(
            vendors.total
          )}
          subtitle={`${vendors.active || 0} active`}
          icon={Store}
          iconClass="bg-cyan-50 text-cyan-600"
        />
      </div>

      {/* CHART + VENDORS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* CHART */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Payment Activity
              </h2>

              <p className="text-sm text-slate-500">
                Payment amount for the last
                7 days
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Payment Amount
            </div>
          </div>

          <div className="mt-8 flex h-64 items-end gap-2 overflow-x-auto pb-7">
            {last7Days.map((item) => {
              const amount = Number(
                item.amount || 0
              );

              const height = Math.max(
                (amount /
                  maxChartAmount) *
                100,
                amount > 0 ? 6 : 2
              );

              return (
                <div
                  key={item.date}
                  className="group flex min-w-[52px] flex-1 flex-col items-center justify-end self-stretch"
                >
                  <div className="relative flex h-full w-full items-end justify-center">
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:block">
                      {formatCurrency(
                        amount
                      )}
                    </div>

                    <div
                      className="w-full max-w-10 rounded-t-lg bg-blue-600 transition-all duration-300 group-hover:bg-blue-700"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>

                  <span className="mt-3 whitespace-nowrap text-[11px] font-medium text-slate-400">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* VENDOR OVERVIEW */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Vendor Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current vendor status
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Active Vendors
                </span>

                <span className="font-bold text-emerald-600">
                  {vendors.active || 0}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${vendors.total
                        ? Math.min(
                          (vendors.active /
                            vendors.total) *
                          100,
                          100
                        )
                        : 0
                      }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Inactive Vendors
                </span>

                <span className="font-bold text-slate-500">
                  {vendors.inactive || 0}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{
                    width: `${vendors.total
                        ? Math.min(
                          (vendors.inactive /
                            vendors.total) *
                          100,
                          100
                        )
                        : 0
                      }%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    Total Vendors
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {formatNumber(
                      vendors.total
                    )}
                  </p>
                </div>

                <Store
                  size={26}
                  className="text-blue-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT PAYMENTS */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Recent Payments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest payment activity
          </p>
        </div>

        {/* DESKTOP */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vendor
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentPayments.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                recentPayments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                          {payment.orderId ||
                            "-"}
                        </div>

                        <div className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                          {payment.paykarReference ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-800">
                          {payment.vendor
                            ?.companyName ||
                            payment.vendorSlug ||
                            "-"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {payment.vendor
                            ?.slug ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-800">
                          {payment.customerName ||
                            "-"}
                        </div>

                        <div className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                          {payment.customerEmail ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-900">
                          {formatCurrency(
                            payment.amount
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {payment.currency ||
                            "INR"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                            payment.status
                          )}`}
                        >
                          {payment.status ||
                            "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          payment.createdAt ||
                          payment.created_at
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}

        <div className="divide-y divide-slate-100 md:hidden">
          {recentPayments.length ===
            0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              No payments found.
            </div>
          ) : (
            recentPayments.map(
              (payment) => (
                <div
                  key={payment.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {payment.orderId ||
                          "-"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {payment.vendor
                          ?.companyName ||
                          payment.vendorSlug ||
                          "-"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                        payment.status
                      )}`}
                    >
                      {payment.status ||
                        "-"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {payment.customerName ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-900">
                        {formatCurrency(
                          payment.amount
                        )}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(
                          payment.createdAt ||
                          payment.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;