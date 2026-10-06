import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Copy,
  Edit3,
  ExternalLink,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  activateVendor,
  deactivateVendor,
  deleteVendor,
  getVendors,
} from "../../services/vendorApi";

import { useNavigate } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";

import { usePermission } from "../../hooks/usePermission";


// ============================================================
// ROLE HELPER
// ============================================================

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};


// ============================================================
// READ ADMIN FROM LOCAL STORAGE
// ============================================================
//
// We try several common keys so this page does not depend
// only on usePermission().
//
// IMPORTANT:
// If your login stores the admin under another key,
// add that key here.
// ============================================================

const getStoredAdmin = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "admin",
    "authAdmin",
    "currentAdmin",
    "user",
    "authUser",
    "adminUser",
  ];

  for (const key of possibleKeys) {
    try {
      const value =
        window.localStorage.getItem(key);

      if (!value) {
        continue;
      }

      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        // Direct admin object
        if (
          parsed.role ||
          parsed.username ||
          parsed.adminId ||
          parsed.id
        ) {
          return parsed;
        }

        // Possible nested structure:
        // { admin: {...} }

        if (
          parsed.admin &&
          typeof parsed.admin === "object"
        ) {
          return parsed.admin;
        }

        // Possible nested structure:
        // { data: { admin: {...} } }

        if (
          parsed.data?.admin &&
          typeof parsed.data.admin === "object"
        ) {
          return parsed.data.admin;
        }

        // Possible nested structure:
        // { data: {...} }

        if (
          parsed.data &&
          typeof parsed.data === "object" &&
          parsed.data.role
        ) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn(
        `Unable to parse localStorage key "${key}"`,
        error
      );
    }
  }

  return null;
};


// ============================================================
// COMPONENT
// ============================================================

const Vendors = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // AUTH HOOK
  // ----------------------------------------------------------

  const permissionContext =
    usePermission();

  const permissionAdmin =
    permissionContext?.admin || null;

  // ----------------------------------------------------------
  // GET ADMIN
  // ----------------------------------------------------------
  //
  // Prefer the admin returned by usePermission().
  // If it does not contain a role, fallback to localStorage.
  // ----------------------------------------------------------

  const storedAdmin =
    getStoredAdmin();

  const admin =
    permissionAdmin?.role
      ? permissionAdmin
      : storedAdmin;

  // ----------------------------------------------------------
  // ROLE
  // ----------------------------------------------------------

  const role = normalizeRole(
    admin?.role
  );

  const isSuperAdmin =
    role === "SUPER_ADMIN";

  const isSubAdmin =
    role === "SUB_ADMIN" ||
    role === "SUBADMIN";

  // ----------------------------------------------------------
  // DEBUG
  // ----------------------------------------------------------
  //
  // Open browser console and you should see:
  //
  // ADMIN ROLE: SUPER_ADMIN
  // IS SUPER ADMIN: true
  //
  // ----------------------------------------------------------

  useEffect(() => {
    console.log(
      "=============================="
    );

    console.log(
      "VENDORS PAGE AUTH DEBUG"
    );

    console.log(
      "Permission Admin:",
      permissionAdmin
    );

    console.log(
      "Stored Admin:",
      storedAdmin
    );

    console.log(
      "Final Admin:",
      admin
    );

    console.log(
      "Admin Role:",
      role
    );

    console.log(
      "Is Super Admin:",
      isSuperAdmin
    );

    console.log(
      "Is Sub Admin:",
      isSubAdmin
    );

    console.log(
      "=============================="
    );
  }, [
    role,
    isSuperAdmin,
    isSubAdmin,
  ]);

  // ==========================================================
  // PERMISSIONS
  // ==========================================================
  //
  // SUPER ADMIN:
  //
  // Create       YES
  // Edit         YES
  // Access       YES
  // Activate     YES
  // Deactivate   YES
  // Delete       YES
  // Payments     YES
  //
  // SUB ADMIN:
  //
  // Create       NO
  // Edit         NO
  // Access       NO
  // Activate     NO
  // Deactivate   NO
  // Delete       NO
  // Payments     YES
  //
  // Backend remains the real security layer.
  // ==========================================================

  const canCreate =
    isSuperAdmin;

  const canEdit =
    isSuperAdmin;

  const canActivate =
    isSuperAdmin;

  const canDeactivate =
    isSuperAdmin;

  const canDelete =
    isSuperAdmin;

  const canManageAccess =
    isSuperAdmin;

  const canViewPayments =
    true;

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    vendors,
    setVendors,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    confirm,
    setConfirm,
  ] = useState({
    open: false,
    type: null,
    vendor: null,
  });

  // ==========================================================
  // FETCH VENDORS
  // ==========================================================

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getVendors();

      if (response?.success) {
        setVendors(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } else {
        setError(
          response?.message ||
          "Failed to load vendors"
        );
      }
    } catch (err) {
      console.error(
        "Get vendors error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
        err?.message ||
        "Failed to load vendors"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // ==========================================================
  // FILTER VENDORS
  // ==========================================================

  const filteredVendors =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return vendors.filter(
        (vendor) => {
          const companyName =
            String(
              vendor?.companyName ||
              ""
            ).toLowerCase();

          const slug =
            String(
              vendor?.slug || ""
            ).toLowerCase();

          const matchesSearch =
            !query ||
            companyName.includes(
              query
            ) ||
            slug.includes(query);

          const matchesStatus =
            statusFilter ===
            "ALL" ||
            (statusFilter ===
              "ACTIVE" &&
              vendor.isActive ===
              true) ||
            (statusFilter ===
              "INACTIVE" &&
              vendor.isActive ===
              false);

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      vendors,
      search,
      statusFilter,
    ]);

  // ==========================================================
  // COPY PAYMENT LINK
  // ==========================================================

  const handleCopyLink = async (
    paymentUrl
  ) => {
    try {
      if (!paymentUrl) {
        return;
      }

      await navigator.clipboard.writeText(
        paymentUrl
      );

      setSuccess(
        "Payment link copied successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error(
        "Copy link error:",
        err
      );

      setError(
        "Failed to copy payment link."
      );

      setTimeout(() => {
        setError("");
      }, 2500);
    }
  };

  // ==========================================================
  // OPEN CONFIRM
  // ==========================================================

  const openConfirm = (
    type,
    vendor
  ) => {
    setConfirm({
      open: true,
      type,
      vendor,
    });
  };

  // ==========================================================
  // CLOSE CONFIRM
  // ==========================================================

  const closeConfirm = () => {
    setConfirm({
      open: false,
      type: null,
      vendor: null,
    });
  };

  // ==========================================================
  // CONFIRM ACTION
  // ==========================================================

  const handleConfirmAction =
    async () => {
      const {
        type,
        vendor,
      } = confirm;

      if (!vendor) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        if (
          type ===
          "activate"
        ) {
          await activateVendor(
            vendor.id
          );

          setSuccess(
            "Vendor activated successfully."
          );
        }

        if (
          type ===
          "deactivate"
        ) {
          await deactivateVendor(
            vendor.id
          );

          setSuccess(
            "Vendor deactivated successfully."
          );
        }

        if (
          type ===
          "delete"
        ) {
          await deleteVendor(
            vendor.id
          );

          setSuccess(
            "Vendor deleted successfully."
          );
        }

        closeConfirm();

        await fetchVendors();

        setTimeout(() => {
          setSuccess("");
        }, 2500);
      } catch (err) {
        console.error(
          "Vendor action error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
          err?.message ||
          "Action failed"
        );

        closeConfirm();
      }
    };

  // ==========================================================
  // CONFIRM DATA
  // ==========================================================

  const getConfirmData = () => {
    if (!confirm.vendor) {
      return {
        title: "Confirm Action",
        message:
          "Are you sure?",
      };
    }

    const companyName =
      confirm.vendor
        ?.companyName ||
      "this vendor";

    if (
      confirm.type ===
      "activate"
    ) {
      return {
        title:
          "Activate Vendor",
        message:
          `Are you sure you want to activate "${companyName}"?`,
      };
    }

    if (
      confirm.type ===
      "deactivate"
    ) {
      return {
        title:
          "Deactivate Vendor",
        message:
          `Are you sure you want to deactivate "${companyName}"?`,
      };
    }

    if (
      confirm.type ===
      "delete"
    ) {
      return {
        title:
          "Delete Vendor",
        message:
          `Are you sure you want to permanently delete "${companyName}"?`,
      };
    }

    return {
      title: "Confirm Action",
      message:
        "Are you sure?",
    };
  };

  const confirmData =
    getConfirmData();

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div>

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Vendors
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage vendor payment links and payments.
          </p>
        </div>

        {/* ================================================== */}
        {/* CREATE VENDOR */}
        {/* ================================================== */}

        {canCreate && (
          <button
            type="button"
            onClick={() =>
              navigate(
                "/vendors/create"
              )
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Create Vendor
          </button>
        )}

      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* ==================================================== */}
      {/* FILTERS */}
      {/* ==================================================== */}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search company or slug..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">
              All Vendors
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

        </div>

      </div>

      {/* ==================================================== */}
      {/* TABLE */}
      {/* ==================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {loading ? (

          <div className="flex min-h-[350px] items-center justify-center">
            <Loader text="Loading vendors..." />
          </div>

        ) : filteredVendors.length ===
          0 ? (

          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <WalletCards
                size={25}
              />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800">
              No vendors found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-400">
              No vendors are available for your account.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Vendor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Payment Link
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredVendors.map(
                  (vendor) => (

                    <tr
                      key={vendor.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* VENDOR */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                            {vendor.companyName
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              "V"}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {
                                vendor.companyName
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              /{vendor.slug}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PAYMENT LINK */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="max-w-[320px] truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            {
                              vendor.paymentUrl ||
                              "-"
                            }
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyLink(
                                vendor.paymentUrl
                              )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Copy payment link"
                          >
                            <Copy
                              size={15}
                            />
                          </button>

                          {vendor.paymentUrl ? (
                            <a
                              href={
                                vendor.paymentUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Open payment link"
                            >
                              <ExternalLink
                                size={15}
                              />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300"
                              title="Payment link unavailable"
                            >
                              <ExternalLink
                                size={15}
                              />
                            </button>
                          )}

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        {vendor.isActive ? (

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Active

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                            Inactive

                          </span>

                        )}

                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-4 text-sm text-slate-500">

                        {vendor.createdAt
                          ? new Date(
                            vendor.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                          : "-"}

                      </td>

                      {/* ================================================== */}
                      {/* ACTIONS */}
                      {/* ================================================== */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* ============================================ */}
                          {/* VIEW PAYMENTS */}
                          {/* ============================================ */}

                          {canViewPayments && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/vendors/${vendor.id}/payments`
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="View payments"
                            >
                              <Activity
                                size={16}
                              />
                            </button>
                          )}

                          {/* ============================================ */}
                          {/* MANAGE ACCESS */}
                          {/* SUPER ADMIN ONLY */}
                          {/* ============================================ */}

                          {canManageAccess && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/vendors/${vendor.id}/access`
                                )
                              }
                              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              title="Manage Sub Admin Access"
                            >
                              <ShieldCheck
                                size={15}
                              />


                            </button>
                          )}

                          {/* ============================================ */}
                          {/* EDIT */}
                          {/* SUPER ADMIN ONLY */}
                          {/* ============================================ */}

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/vendors/${vendor.id}/edit`
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit vendor"
                            >
                              <Edit3
                                size={16}
                              />
                            </button>
                          )}

                          {/* ============================================ */}
                          {/* ACTIVATE / DEACTIVATE */}
                          {/* SUPER ADMIN ONLY */}
                          {/* ============================================ */}

                          {vendor.isActive
                            ? canDeactivate && (
                              <button
                                type="button"
                                onClick={() =>
                                  openConfirm(
                                    "deactivate",
                                    vendor
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                title="Deactivate vendor"
                              >
                                <Power
                                  size={16}
                                />
                              </button>
                            )
                            : canActivate && (
                              <button
                                type="button"
                                onClick={() =>
                                  openConfirm(
                                    "activate",
                                    vendor
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                title="Activate vendor"
                              >
                                <Power
                                  size={16}
                                />
                              </button>
                            )}

                          {/* ============================================ */}
                          {/* DELETE */}
                          {/* SUPER ADMIN ONLY */}
                          {/* ============================================ */}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                openConfirm(
                                  "delete",
                                  vendor
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              title="Delete vendor"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* CONFIRM DIALOG */}
      {/* ==================================================== */}

      <ConfirmDialog
        open={confirm.open}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={
          confirm.type ===
            "delete"
            ? "Delete"
            : confirm.type ===
              "activate"
              ? "Activate"
              : "Deactivate"
        }
        onConfirm={
          handleConfirmAction
        }
        onCancel={
          closeConfirm
        }
      />

    </div>
  );
};

export default Vendors;