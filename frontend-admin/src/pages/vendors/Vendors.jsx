import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Copy,
  Edit3,
  ExternalLink,
  Link as LinkIcon,
  Plus,
  Power,
  Search,
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
import { PERMISSIONS } from "../../constants/permissions";

const Vendors = () => {
  const navigate = useNavigate();

  const canCreate = usePermission(PERMISSIONS.CREATE_VENDOR);
  const canEdit = usePermission(PERMISSIONS.EDIT_VENDOR);
  const canActivate = usePermission(PERMISSIONS.ACTIVATE_VENDOR);
  const canDeactivate = usePermission(PERMISSIONS.DEACTIVATE_VENDOR);
  const canDelete = usePermission(PERMISSIONS.DELETE_VENDOR);
  const canViewPayments = usePermission(
    PERMISSIONS.VIEW_VENDOR_PAYMENTS
  );

  const [vendors, setVendors] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    vendor: null,
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVendors();

      if (response?.success) {
        setVendors(response.data || []);
      } else {
        setError(
          response?.message || "Failed to load vendors"
        );
      }
    } catch (err) {
      console.error("Get vendors error:", err);

      setError(
        err?.response?.data?.message ||
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

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        vendor.companyName
          ?.toLowerCase()
          .includes(query) ||
        vendor.slug
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          vendor.isActive === true) ||
        (statusFilter === "INACTIVE" &&
          vendor.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  const handleCopyLink = async (paymentUrl) => {
    try {
      await navigator.clipboard.writeText(paymentUrl);

      setSuccess("Payment link copied successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Copy link error:", error);
    }
  };

  const handleConfirmAction = async () => {
    const { type, vendor } = confirm;

    if (!vendor) return;

    try {
      setError("");
      setSuccess("");

      if (type === "activate") {
        await activateVendor(vendor.id);

        setSuccess(
          "Vendor activated successfully."
        );
      }

      if (type === "deactivate") {
        await deactivateVendor(vendor.id);

        setSuccess(
          "Vendor deactivated successfully."
        );
      }

      if (type === "delete") {
        await deleteVendor(vendor.id);

        setSuccess(
          "Vendor deleted successfully."
        );
      }

      setConfirm({
        open: false,
        type: null,
        vendor: null,
      });

      await fetchVendors();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Vendor action error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Action failed"
      );

      setConfirm({
        open: false,
        type: null,
        vendor: null,
      });
    }
  };

  const getConfirmData = () => {
    if (!confirm.vendor) {
      return {
        title: "Confirm Action",
        message: "Are you sure?",
      };
    }

    if (confirm.type === "activate") {
      return {
        title: "Activate Vendor",
        message: `Are you sure you want to activate "${confirm.vendor.companyName}"?`,
      };
    }

    if (confirm.type === "deactivate") {
      return {
        title: "Deactivate Vendor",
        message: `Are you sure you want to deactivate "${confirm.vendor.companyName}"?`,
      };
    }

    if (confirm.type === "delete") {
      return {
        title: "Delete Vendor",
        message: `Are you sure you want to permanently delete "${confirm.vendor.companyName}"?`,
      };
    }

    return {
      title: "Confirm Action",
      message: "Are you sure?",
    };
  };

  const confirmData = getConfirmData();

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Vendors
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage vendor payment links and payments.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => navigate("/vendors/create")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Create Vendor
          </button>
        )}
      </div>

      {/* Alerts */}

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

      {/* Filters */}

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
                setSearch(e.target.value)
              }
              placeholder="Search company or slug..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">All Vendors</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <Loader text="Loading vendors..." />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <WalletCards size={25} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800">
              No vendors found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-400">
              Create your first vendor to generate a payment link.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
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
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Vendor */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                          {vendor.companyName
                            ?.charAt(0)
                            ?.toUpperCase() || "V"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {vendor.companyName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            /{vendor.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Payment Link */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="max-w-[320px] truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {vendor.paymentUrl}
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
                          <Copy size={15} />
                        </button>

                        <a
                          href={vendor.paymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Open payment link"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </td>

                    {/* Status */}

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

                    {/* Created */}

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {vendor.createdAt
                        ? new Date(
                            vendor.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
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
                            <Activity size={16} />
                          </button>
                        )}

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
                            <Edit3 size={16} />
                          </button>
                        )}

                        {vendor.isActive
                          ? canDeactivate && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    type: "deactivate",
                                    vendor,
                                  })
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                title="Deactivate vendor"
                              >
                                <Power size={16} />
                              </button>
                            )
                          : canActivate && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    type: "activate",
                                    vendor,
                                  })
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                title="Activate vendor"
                              >
                                <Power size={16} />
                              </button>
                            )}

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                type: "delete",
                                vendor,
                              })
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete vendor"
                          >
                            <Trash2 size={16} />
                          </button>
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

      <ConfirmDialog
        open={confirm.open}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={
          confirm.type === "delete"
            ? "Delete"
            : confirm.type === "activate"
            ? "Activate"
            : "Deactivate"
        }
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirm({
            open: false,
            type: null,
            vendor: null,
          })
        }
      />
    </div>
  );
};

export default Vendors;