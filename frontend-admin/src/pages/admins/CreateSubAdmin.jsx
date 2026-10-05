import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  Shield,
  UserPlus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import {
  PERMISSIONS,
  PERMISSION_LABELS,
} from "../../constants/permissions";

const permissionGroups = [
  {
    title: "Dashboard",
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
    ],
  },

  {
    title: "Payments",
    permissions: [
      PERMISSIONS.VIEW_PAYMENTS,
      PERMISSIONS.VIEW_PAYMENT_DETAILS,
      PERMISSIONS.CREATE_PAYMENT,
    ],
  },

  {
    title: "Admins",
    permissions: [
      PERMISSIONS.VIEW_ADMINS,
      PERMISSIONS.CREATE_SUB_ADMIN,
      PERMISSIONS.EDIT_SUB_ADMIN,
      PERMISSIONS.ACTIVATE_SUB_ADMIN,
      PERMISSIONS.DEACTIVATE_SUB_ADMIN,
      PERMISSIONS.RESET_SUB_ADMIN_PASSWORD,
      PERMISSIONS.EDIT_SUPER_ADMIN,
      PERMISSIONS.RESET_SUPER_ADMIN_PASSWORD,
    ],
  },

  {
    title: "Vendors",
    permissions: [
      PERMISSIONS.VIEW_VENDORS,
      PERMISSIONS.CREATE_VENDOR,
      PERMISSIONS.EDIT_VENDOR,
      PERMISSIONS.ACTIVATE_VENDOR,
      PERMISSIONS.DEACTIVATE_VENDOR,
      PERMISSIONS.DELETE_VENDOR,
      PERMISSIONS.VIEW_VENDOR_PAYMENTS,
    ],
  },
];

const CreateSubAdmin = () => {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    selectedPermissions,
    setSelectedPermissions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const allPermissions = useMemo(
    () =>
      permissionGroups.flatMap(
        (group) => group.permissions
      ),
    []
  );

  const allSelected =
    selectedPermissions.length ===
    allPermissions.length;

  const togglePermission = (
    permission
  ) => {
    setSelectedPermissions(
      (current) => {
        if (
          current.includes(permission)
        ) {
          return current.filter(
            (item) =>
              item !== permission
          );
        }

        return [
          ...current,
          permission,
        ];
      }
    );
  };

  const toggleAllPermissions =
    () => {
      if (allSelected) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions([
          ...allPermissions,
        ]);
      }
    };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError(
        "Username is required."
      );
      return;
    }

    if (!password) {
      setError(
        "Password is required."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/api/admin/sub-admin",
        {
          username:
            username.trim(),
          password,
          permissions:
            selectedPermissions,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to create sub admin"
        );
      }

      navigate("/admins");
    } catch (error) {
      console.error(
        "Create sub admin error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create sub admin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() =>
            navigate("/admins")
          }
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Admin Management
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900">
            Create Sub Admin
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a sub admin and assign
            access permissions.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ACCOUNT */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Account Details
              </h2>

              <p className="text-sm text-slate-500">
                Set login credentials.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Enter username"
                autoComplete="username"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter password"
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <p className="mt-2 text-xs text-slate-400">
                Minimum 6 characters.
              </p>
            </div>
          </div>
        </div>

        {/* PERMISSIONS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Shield size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Permissions
                </h2>

                <p className="text-sm text-slate-500">
                  Select what this sub admin
                  can access.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                toggleAllPermissions
              }
              className="h-10 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              {allSelected
                ? "Remove All"
                : "Select All"}
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {permissionGroups.map(
              (group) => (
                <div
                  key={group.title}
                >
                  <h3 className="mb-3 text-sm font-bold text-slate-800">
                    {group.title}
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map(
                      (permission) => {
                        const selected =
                          selectedPermissions.includes(
                            permission
                          );

                        return (
                          <button
                            type="button"
                            key={
                              permission
                            }
                            onClick={() =>
                              togglePermission(
                                permission
                              )
                            }
                            className={`flex min-h-[58px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selected && (
                                <Check
                                  size={14}
                                />
                              )}
                            </span>

                            <span
                              className={`text-sm font-semibold ${
                                selected
                                  ? "text-blue-800"
                                  : "text-slate-700"
                              }`}
                            >
                              {
                                PERMISSION_LABELS[
                                  permission
                                ]
                              }
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-700">
              <strong>
                {
                  selectedPermissions.length
                }
              </strong>{" "}
              permission
              {selectedPermissions.length ===
              1
                ? ""
                : "s"}{" "}
              selected.
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* BUTTONS */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/admins")
            }
            disabled={loading}
            className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating..."
              : "Create Sub Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubAdmin;