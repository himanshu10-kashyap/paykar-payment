import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Link as LinkIcon,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  editVendor,
  getVendor,
} from "../../services/vendorApi";
import Loader from "../../components/common/Loader";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../constants/permissions";

const EditVendor = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const canEdit = usePermission(
    PERMISSIONS.EDIT_VENDOR
  );

  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadVendor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getVendor(id);

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load vendor."
          );
        }

        setCompanyName(
          response.data?.companyName || ""
        );

        setSlug(response.data?.slug || "");
      } catch (err) {
        console.error("Get vendor error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load vendor."
        );
      } finally {
        setLoading(false);
      }
    };

    loadVendor();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await editVendor({
        id,
        companyName: companyName.trim(),
        slug: slug.trim(),
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update vendor."
        );
      }

      setSuccess(
        "Vendor updated successfully."
      );

      setTimeout(() => {
        navigate("/vendors");
      }, 800);
    } catch (err) {
      console.error("Edit vendor error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update vendor."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
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
            Edit Vendor
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update vendor company name or payment link.
          </p>
        </div>
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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Company Name
            </label>

            <div className="relative">
              <Building2
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Payment Link Slug
            </label>

            <div className="relative">
              <LinkIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Changing the slug will change the payment URL.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Payment Link
          </p>

          <p className="mt-2 break-all text-sm font-semibold text-slate-800">
            https://thenexuspay.com/{slug}
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/vendors")}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !canEdit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVendor;