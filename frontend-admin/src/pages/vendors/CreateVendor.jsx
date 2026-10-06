import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Link as LinkIcon,
  Save,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { createVendor } from "../../services/vendorApi";

import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../constants/permissions";

const CreateVendor = () => {
  const navigate = useNavigate();

  const canCreate = usePermission(
    PERMISSIONS.CREATE_VENDOR
  );

  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!canCreate) {
      setError(
        "You do not have permission to create a vendor."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await createVendor({
        companyName: companyName.trim(),
        slug: slug.trim() || undefined,
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Failed to create vendor."
        );
      }

      setSuccess(
        "Vendor created successfully."
      );

      setTimeout(() => {
        navigate("/vendors");
      }, 800);
    } catch (err) {
      console.error("Create vendor error:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create vendor."
      );
    } finally {
      setLoading(false);
    }
  };

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
            Create Vendor
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a vendor and generate its payment link.
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
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 size={23} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Vendor Information
            </h2>

            <p className="text-sm text-slate-400">
              Enter the company details below.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Company Name */}

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
                placeholder="e.g. The Nexus Pay"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Slug */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Payment Link Slug
              <span className="ml-2 font-normal text-slate-400">
                Optional
              </span>
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
                placeholder="e.g. nexus"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Leave empty to generate the slug automatically
              from the company name.
            </p>
          </div>
        </div>

        {/* Preview */}

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Payment Link Preview
          </p>

          <p className="mt-2 break-all text-sm font-semibold text-slate-800">
            https://paykar.dummydoma.in/
            {slug.trim() ||
              companyName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") ||
              "your-slug"}
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
            disabled={loading || !canCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {loading
              ? "Creating..."
              : "Create Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendor;