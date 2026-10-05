import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { getPayments } from "../../services/paymentApi";
import { getVendors } from "../../services/vendorApi";

import Loader from "../../components/common/Loader";

import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../constants/permissions";

const Payments = () => {
    const canViewDetails = usePermission(
        PERMISSIONS.VIEW_PAYMENT_DETAILS
    );

    const [payments, setPayments] = useState([]);
    const [vendors, setVendors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [vendorsLoading, setVendorsLoading] =
        useState(true);

    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        vendorId: "",
        status: "",
        paymentStatus: "",
        dateFrom: "",
        dateTo: "",
        paymentMethod: "",
        currency: "",
        // environment: "",
        minAmount: "",
        maxAmount: "",
    });

    const [appliedFilters, setAppliedFilters] =
        useState(filters);

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const [showFilters, setShowFilters] =
        useState(false);

    const [sortBy, setSortBy] =
        useState("createdAt");

    const [sortOrder, setSortOrder] =
        useState("DESC");

    /*
    |--------------------------------------------------------------------------
    | Load Vendors
    |--------------------------------------------------------------------------
    */

    const loadVendors = async () => {
        try {
            setVendorsLoading(true);

            const response = await getVendors();

            if (response.success) {
                setVendors(response.data || []);
            }
        } catch (error) {
            console.error(
                "Load vendors error:",
                error
            );
        } finally {
            setVendorsLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Load Payments
    |--------------------------------------------------------------------------
    */

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getPayments({
                page,
                limit: 10,

                ...appliedFilters,

                sortBy,
                sortOrder,
            });

            if (!response.success) {
                throw new Error(
                    response.message ||
                    "Failed to load payments"
                );
            }

            setPayments(response.data || []);

            setPagination(
                response.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                }
            );
        } catch (error) {
            console.error(
                "Load payments error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error.message ||
                "Failed to load payments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    useEffect(() => {
        loadPayments();
    }, [
        page,
        appliedFilters,
        sortBy,
        sortOrder,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Filter Change
    |--------------------------------------------------------------------------
    */

    const handleFilterChange = (
        field,
        value
    ) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Apply Filters
    |--------------------------------------------------------------------------
    */

    const handleApplyFilters = () => {
        setPage(1);
        setAppliedFilters(filters);
    };

    /*
    |--------------------------------------------------------------------------
    | Reset Filters
    |--------------------------------------------------------------------------
    */

    const handleResetFilters = () => {
        const reset = {
            search: "",
            vendorId: "",
            status: "",
            paymentStatus: "",
            dateFrom: "",
            dateTo: "",
            paymentMethod: "",
            currency: "",
            //   environment: "",
            minAmount: "",
            maxAmount: "",
        };

        setFilters(reset);
        setAppliedFilters(reset);
        setPage(1);
    };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);
        setAppliedFilters(filters);
    };

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder((prev) =>
                prev === "ASC"
                    ? "DESC"
                    : "ASC"
            );

            return;
        }

        setSortBy(field);
        setSortOrder("DESC");
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
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            case "FAILED":
            case "FAILURE":
                return "bg-red-50 text-red-700 border-red-200";

            case "CANCELLED":
            case "CANCELED":
                return "bg-orange-50 text-orange-700 border-orange-200";

            case "EXPIRED":
                return "bg-slate-100 text-slate-700 border-slate-200";

            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-200";

            default:
                return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    const totalAmount = useMemo(() => {
        return payments.reduce(
            (total, payment) =>
                total +
                Number(payment.amount || 0),
            0
        );
    }, [payments]);

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
                    <h1 className="text-2xl font-bold text-slate-900">
                        Payments
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage and monitor all vendor
                        payment transactions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadPayments}
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>
            </div>

            {/* Summary */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Payments
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {pagination.total}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Current Page
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-600">
                        {payments.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Current Page Amount
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(totalAmount)}
                    </p>
                </div>
            </div>

            {/* Search */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 lg:flex-row"
                >
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={filters.search}
                            onChange={(event) =>
                                handleFilterChange(
                                    "search",
                                    event.target.value
                                )
                            }
                            placeholder="Search order ID, transaction ID, UTR, customer..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowFilters(
                                (prev) => !prev
                            )
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <Filter size={17} />

                        Filters
                    </button>
                </form>

                {/* Filters */}

                {showFilters && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {/* Vendor */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Vendor
                                </label>

                                <select
                                    value={filters.vendorId}
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "vendorId",
                                            event.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        All Vendors
                                    </option>

                                    {vendors.map(
                                        (vendor) => (
                                            <option
                                                key={vendor.id}
                                                value={vendor.id}
                                            >
                                                {
                                                    vendor.companyName
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Status */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </label>

                                <select
                                    value={filters.status}
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "status",
                                            event.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        All Statuses
                                    </option>

                                    <option value="CREATED">
                                        Created
                                    </option>

                                    <option value="INITIATED">
                                        Initiated
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="SUCCESS">
                                        Success
                                    </option>

                                    <option value="FAILED">
                                        Failed
                                    </option>

                                    <option value="CANCELLED">
                                        Cancelled
                                    </option>

                                    <option value="EXPIRED">
                                        Expired
                                    </option>
                                </select>
                            </div>

                            {/* Payment Status */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Payment Status
                                </label>

                                <input
                                    type="text"
                                    value={
                                        filters.paymentStatus
                                    }
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "paymentStatus",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. completed"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Payment Method */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Payment Method
                                </label>

                                <input
                                    type="text"
                                    value={
                                        filters.paymentMethod
                                    }
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "paymentMethod",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. BHIM UPI QR"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Currency */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Currency
                                </label>

                                <select
                                    value={filters.currency}
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "currency",
                                            event.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        All Currencies
                                    </option>

                                    <option value="INR">
                                        INR
                                    </option>

                                    <option value="USD">
                                        USD
                                    </option>
                                </select>
                            </div>

                            {/* Environment */}

                            {/* <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Environment
                </label>

                <select
                  value={
                    filters.environment
                  }
                  onChange={(event) =>
                    handleFilterChange(
                      "environment",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    All Environments
                  </option>

                  <option value="production">
                    Production
                  </option>

                  <option value="sandbox">
                    Sandbox
                  </option>
                </select>
              </div> */}

                            {/* Date From */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Date From
                                </label>

                                <div className="relative">
                                    <CalendarDays
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="date"
                                        value={
                                            filters.dateFrom
                                        }
                                        onChange={(event) =>
                                            handleFilterChange(
                                                "dateFrom",
                                                event.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Date To */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Date To
                                </label>

                                <div className="relative">
                                    <CalendarDays
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(event) =>
                                            handleFilterChange(
                                                "dateTo",
                                                event.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Min Amount */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Min Amount
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        filters.minAmount
                                    }
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "minAmount",
                                            event.target.value
                                        )
                                    }
                                    placeholder="0"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Max Amount */}

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Max Amount
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        filters.maxAmount
                                    }
                                    onChange={(event) =>
                                        handleFilterChange(
                                            "maxAmount",
                                            event.target.value
                                        )
                                    }
                                    placeholder="50000"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <X size={17} />

                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleApplyFilters
                                }
                                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Table */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader text="Loading payments..." />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center px-5 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                            <Search
                                size={24}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            No payments found
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-slate-500">
                            No payment transactions match
                            your current filters.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Payment
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Vendor
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Customer
                                        </th>

                                        <th
                                            className="cursor-pointer px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-blue-600"
                                            onClick={() =>
                                                handleSort("amount")
                                            }
                                        >
                                            Amount
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Method
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th
                                            className="cursor-pointer px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-blue-600"
                                            onClick={() =>
                                                handleSort("createdAt")
                                            }
                                        >
                                            Date
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {payments.map(
                                        (payment) => (
                                            <tr
                                                key={payment.id}
                                                className="transition hover:bg-slate-50/80"
                                            >
                                                {/* Payment */}

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {payment.orderId ||
                                                                "-"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {payment.paykarTransactionId ||
                                                                payment.paykarReference ||
                                                                "-"}
                                                        </p>

                                                        {payment.utr && (
                                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                                UTR:{" "}
                                                                {payment.utr}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Vendor */}

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {payment
                                                                .vendor
                                                                ?.companyName ||
                                                                payment.vendorSlug ||
                                                                "-"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {payment
                                                                .vendor
                                                                ?.slug ||
                                                                payment.vendorSlug ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Customer */}

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {
                                                                payment.customerName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {
                                                                payment.customerEmail
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {
                                                                payment.customerMobile
                                                            }
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Amount */}

                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-slate-900">
                                                        {formatCurrency(
                                                            payment.amount,
                                                            payment.currency
                                                        )}
                                                    </p>
                                                </td>

                                                {/* Method */}

                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {payment.paymentMethod ||
                                                            "-"}
                                                    </p>
                                                </td>

                                                {/* Status */}

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                                            payment.status
                                                        )}`}
                                                    >
                                                        {payment.status ||
                                                            "-"}
                                                    </span>

                                                    {payment.paymentStatus && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {
                                                                payment.paymentStatus
                                                            }
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Date */}

                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {formatDate(
                                                            payment.createdAt ||
                                                            payment.created_at
                                                        )}
                                                    </p>
                                                </td>

                                                {/* Action */}

                                                <td className="px-5 py-4 text-right">
                                                    {canViewDetails && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                (window.location.href = `/payments/${payment.id}`)
                                                            }
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            title="View payment"
                                                        >
                                                            <Eye
                                                                size={17}
                                                            />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}

                        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {payments.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {pagination.total}
                                </span>{" "}
                                payments
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasPreviousPage
                                    }
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                Math.max(
                                                    prev - 1,
                                                    1
                                                )
                                        )
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft
                                        size={17}
                                    />
                                </button>

                                <span className="min-w-[90px] text-center text-sm font-semibold text-slate-700">
                                    Page{" "}
                                    {pagination.page}{" "}
                                    of{" "}
                                    {Math.max(
                                        pagination.totalPages,
                                        1
                                    )}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasNextPage
                                    }
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                prev + 1
                                        )
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight
                                        size={17}
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Payments;