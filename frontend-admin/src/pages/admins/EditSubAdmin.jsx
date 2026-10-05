import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Shield,
  User,
  UserX,
} from "lucide-react";

import {
  getAdmins,
  editSubAdmin,
} from "../../services/adminApi";

import {
  PERMISSIONS,
  PERMISSION_LABELS,
} from "../../constants/permissions";

import Loader from "../../components/common/Loader";

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
    title: "Administrators",
    permissions: [
      PERMISSIONS.VIEW_ADMINS,
      PERMISSIONS.CREATE_SUB_ADMIN,
      PERMISSIONS.EDIT_SUB_ADMIN,
      PERMISSIONS.RESET_SUB_ADMIN_PASSWORD,
      PERMISSIONS.ACTIVATE_SUB_ADMIN,
      PERMISSIONS.DEACTIVATE_SUB_ADMIN,
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

const allSelectablePermissions =
  permissionGroups.flatMap(
    (group) => group.permissions
  );

const EditSubAdmin = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [admin, setAdmin] = useState(null);

  const [username, setUsername] = useState("");

  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load admin
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdmins();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load administrators"
          );
        }

        const admins = Array.isArray(response.data)
          ? response.data
          : [];

        const selectedAdmin = admins.find(
          (item) =>
            String(item.id) === String(id)
        );

        if (!selectedAdmin) {
          throw new Error(
            "Sub Admin not found"
          );
        }

        if (
          selectedAdmin.role !== "SUB_ADMIN"
        ) {
          throw new Error(
            "Only Sub Admin can be edited"
          );
        }

        if (!mounted) {
          return;
        }

        setAdmin(selectedAdmin);

        setUsername(
          selectedAdmin.username || ""
        );

        setPermissions(
          Array.isArray(
            selectedAdmin.permissions
          )
            ? selectedAdmin.permissions
            : []
        );
      } catch (err) {
        console.error(
          "Load sub admin error:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load sub admin"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Permission count
  |--------------------------------------------------------------------------
  */

  const selectedPermissionCount = useMemo(() => {
    return permissions.filter(
      (permission) =>
        allSelectablePermissions.includes(
          permission
        )
    ).length;
  }, [permissions]);

  /*
  |--------------------------------------------------------------------------
  | Toggle permission
  |--------------------------------------------------------------------------
  */

  const handlePermissionToggle = (
    permission
  ) => {
    setPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter(
          (item) =>
            item !== permission
        );
      }

      return [
        ...current,
        permission,
      ];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Select all
  |--------------------------------------------------------------------------
  */

  const handleSelectAll = () => {
    if (
      selectedPermissionCount ===
      allSelectablePermissions.length
    ) {
      setPermissions([]);
      return;
    }

    setPermissions([
      ...allSelectablePermissions,
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {
      setError(
        "Username is required."
      );
      return;
    }

    if (cleanUsername.length < 3) {
      setError(
        "Username must be at least 3 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await editSubAdmin({
          id,
          username: cleanUsername,
          permissions,
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update sub admin"
        );
      }

      setSuccess(
        "Sub Admin updated successfully."
      );

      setTimeout(() => {
        navigate("/admins");
      }, 700);
    } catch (err) {
      console.error(
        "Edit sub admin error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update sub admin"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader
          size="lg"
          text="Loading Sub Admin..."
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Not found
  |--------------------------------------------------------------------------
  */

  if (!admin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <UserX size={28} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Sub Admin Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The requested Sub Admin could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admins")
            }
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />

            Back to Administrators
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <button
          type="button"
          onClick={() =>
            navigate("/admins")
          }
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />

          Back to Administrators
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Administration
        </p>

        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Edit Sub Admin
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update username and permissions.
        </p>
      </div>

      {/* ================================================= */}
      {/* ALERTS */}
      {/* ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="space-y-6">
            {/* Basic Info */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Basic Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Update Sub Admin account details.
                  </p>
                </div>
              </div>

              {/* Username */}

              <div className="mt-5">
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
                  disabled={saving}
                  autoComplete="username"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Account Info */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Shield size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Account Information
                  </p>

                  <p className="text-xs text-slate-500">
                    Current account details
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">
                    Admin ID
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    #{admin.id}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">
                    Role
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    SUB_ADMIN
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">
                    Permissions
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {selectedPermissionCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT - PERMISSIONS */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Permissions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select the permissions this Sub Admin should have.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={
                  handleSelectAll
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                {selectedPermissionCount ===
                allSelectablePermissions.length
                  ? "Clear All"
                  : "Select All"}
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {permissionGroups.map(
                (group) => (
                  <div
                    key={group.title}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="bg-slate-50 px-4 py-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        {group.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                      {group.permissions.map(
                        (permission) => {
                          const selected =
                            permissions.includes(
                              permission
                            );

                          return (
                            <button
                              type="button"
                              key={permission}
                              disabled={saving}
                              onClick={() =>
                                handlePermissionToggle(
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

            {/* Buttons */}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  navigate("/admins")
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />

                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditSubAdmin;