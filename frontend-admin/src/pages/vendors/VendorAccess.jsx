import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ShieldCheck,
  User,
  UserMinus,
  UserPlus,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { getAdmins } from "../../services/adminApi";

import { getVendor } from "../../services/vendorApi";

import {
  getVendorSubadmins,
  assignVendorToSubadmin,
  removeVendorFromSubadmin,
} from "../../services/vendorAccessApi";

import Loader from "../../components/common/Loader";

const VendorAccess = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [vendor, setVendor] = useState(null);

  const [subadmins, setSubadmins] = useState([]);

  const [assignedIds, setAssignedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [processingId, setProcessingId] =
    useState(null);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);

      setError("");

      setSuccess("");

      const [
        vendorResponse,
        adminsResponse,
        accessResponse,
      ] = await Promise.all([
        getVendor(id),
        getAdmins(),
        getVendorSubadmins(id),
      ]);

      // --------------------------------------------------
      // VENDOR
      // --------------------------------------------------

      if (!vendorResponse?.success) {
        throw new Error(
          vendorResponse?.message ||
            "Failed to load vendor"
        );
      }

      setVendor(vendorResponse.data);

      // --------------------------------------------------
      // ADMINS
      // --------------------------------------------------

      if (!adminsResponse?.success) {
        throw new Error(
          adminsResponse?.message ||
            "Failed to load administrators"
        );
      }

      const admins = Array.isArray(
        adminsResponse.data
      )
        ? adminsResponse.data
        : [];

      // Support both role values
      const onlySubadmins = admins.filter(
        (admin) => {
          const role = String(
            admin?.role || ""
          )
            .trim()
            .toUpperCase();

          return (
            role === "SUB_ADMIN" ||
            role === "SUBADMIN"
          );
        }
      );

      setSubadmins(onlySubadmins);

      // --------------------------------------------------
      // CURRENT VENDOR ACCESS
      // --------------------------------------------------

      const accessData =
        accessResponse?.success
          ? accessResponse.data
          : [];

      /*
       * API can return:
       *
       * data: []
       *
       * OR
       *
       * data: {
       *   subadmins: []
       * }
       *
       * OR
       *
       * data: {
       *   subAdmins: []
       * }
       *
       * OR
       *
       * data: {
       *   data: []
       * }
       */

      let assignedList = [];

      if (Array.isArray(accessData)) {
        assignedList = accessData;
      } else if (
        Array.isArray(
          accessData?.subadmins
        )
      ) {
        assignedList =
          accessData.subadmins;
      } else if (
        Array.isArray(
          accessData?.subAdmins
        )
      ) {
        assignedList =
          accessData.subAdmins;
      } else if (
        Array.isArray(accessData?.data)
      ) {
        assignedList =
          accessData.data;
      }

      const ids = assignedList
        .map(
          (item) =>
            item?.subadminId ??
            item?.subAdminId ??
            item?.subadmin?.id ??
            item?.subAdmin?.id ??
            item?.id
        )
        .filter(
          (value) =>
            value !== undefined &&
            value !== null
        );

      setAssignedIds(ids);
    } catch (err) {
      console.error(
        "Vendor access error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load vendor access."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (!id) {
      return;
    }

    loadData();
  }, [id]);

  // --------------------------------------------------
  // GIVE / REMOVE ACCESS
  // --------------------------------------------------

  const handleToggle = async (
    subadminId
  ) => {
    try {
      setError("");

      setSuccess("");

      setProcessingId(subadminId);

      const assigned = assignedIds.some(
        (item) =>
          String(item) ===
          String(subadminId)
      );

      // ------------------------------------------------
      // REMOVE ACCESS
      // ------------------------------------------------

      if (assigned) {
        await removeVendorFromSubadmin({
          vendorId: id,
          subadminId,
        });

        setAssignedIds(
          (current) =>
            current.filter(
              (item) =>
                String(item) !==
                String(subadminId)
            )
        );

        // ----------------------------------------------
        // SUCCESS MESSAGE
        // ----------------------------------------------

        setSuccess(
          "Vendor access removed successfully."
        );

        setTimeout(() => {
          setSuccess("");
        }, 2500);

        return;
      }

      // ------------------------------------------------
      // GIVE ACCESS
      // ------------------------------------------------

      await assignVendorToSubadmin({
        vendorId: id,
        subadminId,
      });

      setAssignedIds(
        (current) => [
          ...current,
          subadminId,
        ]
      );

      // ----------------------------------------------
      // SUCCESS MESSAGE
      // ----------------------------------------------

      setSuccess(
        "Vendor access given successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Update vendor access error:",
        err
      );

      setSuccess("");

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update vendor access."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader text="Loading vendor access..." />
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <div className="flex items-start gap-3">

        <button
          type="button"
          onClick={() =>
            navigate("/vendors")
          }
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          title="Back to Vendors"
        >
          <ArrowLeft size={18} />
        </button>

        <div>

          <p className="text-sm font-semibold text-blue-600">
            Vendor Management
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Manage Vendor Access
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Assign or remove Sub Admin access for this vendor.
          </p>

        </div>

      </div>

      {/* ------------------------------------------------
          ERROR MESSAGE
      ------------------------------------------------ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ------------------------------------------------
          SUCCESS MESSAGE
      ------------------------------------------------ */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* ------------------------------------------------
          VENDOR
      ------------------------------------------------ */}

      {vendor && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">

              {vendor.companyName
                ?.charAt(0)
                ?.toUpperCase() || "V"}

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                {vendor.companyName}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                /{vendor.slug}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------
          SUB ADMIN ACCESS
      ------------------------------------------------ */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}

        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={21} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Sub Admin Access
              </h2>

              <p className="text-sm text-slate-500">
                Give or remove access to this vendor.
              </p>

            </div>

          </div>

        </div>

        {/* LIST */}

        {subadmins.length === 0 ? (

          <div className="px-6 py-12 text-center">

            <User
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-600">
              No Sub Admins found.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {subadmins.map(
              (admin) => {

                const subadminId =
                  admin.id;

                const assigned =
                  assignedIds.some(
                    (item) =>
                      String(item) ===
                      String(subadminId)
                  );

                const processing =
                  String(processingId) ===
                  String(subadminId);

                return (
                  <div
                    key={subadminId}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >

                    {/* ADMIN */}

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <User size={18} />
                      </div>

                      <div>

                        <p className="font-semibold text-slate-800">
                          {admin.username}
                        </p>

                        <p className="text-xs text-slate-400">
                          Sub Admin
                        </p>

                      </div>

                    </div>

                    {/* ACTION */}

                    <button
                      type="button"
                      disabled={processing}
                      onClick={() =>
                        handleToggle(
                          subadminId
                        )
                      }
                      className={`inline-flex h-10 min-w-[125px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        assigned
                          ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                      }`}
                    >

                      {processing ? (
                        "Processing..."
                      ) : assigned ? (
                        <>
                          <UserMinus
                            size={16}
                          />

                          Remove Access
                        </>
                      ) : (
                        <>
                          <UserPlus
                            size={16}
                          />

                          Give Access
                        </>
                      )}

                    </button>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default VendorAccess;