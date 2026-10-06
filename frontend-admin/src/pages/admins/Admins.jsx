import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Edit3,
  KeyRound,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getAdmins,
  activateSubAdmin,
  deactivateSubAdmin,
  resetSubAdminPassword,
  deleteSubAdmin,
} from "../../services/adminApi";

import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const Admins = () => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset Password
  |--------------------------------------------------------------------------
  */

  const [
    resetPasswordAdmin,
    setResetPasswordAdmin,
  ] = useState(null);

  const [
    resetPassword,
    setResetPassword,
  ] = useState("");

  const [
    resetLoading,
    setResetLoading,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Activate / Deactivate Confirmation
  |--------------------------------------------------------------------------
  */

  const [
    confirmDialog,
    setConfirmDialog,
  ] = useState({
    open: false,
    admin: null,
    action: null,
  });

  /*
  |--------------------------------------------------------------------------
  | Delete Confirmation
  |--------------------------------------------------------------------------
  */

  const [
    deleteDialog,
    setDeleteDialog,
  ] = useState({
    open: false,
    admin: null,
  });

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Admins
  |--------------------------------------------------------------------------
  */

  const loadAdmins = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getAdmins();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load admins"
          );
        }

        setAdmins(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Get admins error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load admins"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  /*
  |--------------------------------------------------------------------------
  | Open Activate / Deactivate Dialog
  |--------------------------------------------------------------------------
  */

  const openStatusDialog = (admin) => {
    setConfirmDialog({
      open: true,
      admin,
      action: admin.isActive
        ? "deactivate"
        : "activate",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Close Activate / Deactivate Dialog
  |--------------------------------------------------------------------------
  */

  const closeStatusDialog = () => {
    setConfirmDialog({
      open: false,
      admin: null,
      action: null,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Activate / Deactivate Sub Admin
  |--------------------------------------------------------------------------
  */

  const handleActivateDeactivate =
    async () => {
      const admin =
        confirmDialog.admin;

      const action =
        confirmDialog.action;

      if (!admin || !action) {
        return;
      }

      try {
        setError("");

        closeStatusDialog();

        if (action === "activate") {
          await activateSubAdmin(
            admin.id
          );
        } else {
          await deactivateSubAdmin(
            admin.id
          );
        }

        await loadAdmins(true);
      } catch (error) {
        console.error(
          "Update admin status error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update admin status"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open Reset Password
  |--------------------------------------------------------------------------
  */

  const openResetPassword = (admin) => {
    setResetPasswordAdmin(admin);
    setResetPassword("");
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Close Reset Password
  |--------------------------------------------------------------------------
  */

  const closeResetPassword = () => {
    if (resetLoading) {
      return;
    }

    setResetPasswordAdmin(null);
    setResetPassword("");
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Password
  |--------------------------------------------------------------------------
  */

  const handleResetPassword =
    async (event) => {
      event.preventDefault();

      if (!resetPasswordAdmin) {
        return;
      }

      if (resetPassword.length < 6) {
        setError(
          "Password must be at least 6 characters."
        );

        return;
      }

      try {
        setResetLoading(true);
        setError("");

        await resetSubAdminPassword({
          id: resetPasswordAdmin.id,
          password: resetPassword,
        });

        closeResetPassword();

        await loadAdmins(true);
      } catch (error) {
        console.error(
          "Reset admin password error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to reset password"
        );
      } finally {
        setResetLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open Delete Dialog
  |--------------------------------------------------------------------------
  */

  const openDeleteDialog = (admin) => {
    setDeleteDialog({
      open: true,
      admin,
    });

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Close Delete Dialog
  |--------------------------------------------------------------------------
  */

  const closeDeleteDialog = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteDialog({
      open: false,
      admin: null,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Sub Admin
  |--------------------------------------------------------------------------
  */

  const handleDeleteSubAdmin = async () => {
    const admin = deleteDialog.admin;

    if (!admin) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      await deleteSubAdmin(admin.id);

      closeDeleteDialog();

      await loadAdmins(true);
    } catch (error) {
      console.error(
        "Delete sub admin error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete sub admin"
      );
    } finally {
      setDeleteLoading(false);
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
          text="Loading admins..."
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Admins
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage sub admins and their permissions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">

          {/* Refresh */}

          <button
            type="button"
            onClick={() =>
              loadAdmins(true)
            }
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

            Refresh
          </button>

          {/* Create Sub Admin */}

          <button
            type="button"
            onClick={() =>
              navigate("/admins/create")
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Create Sub Admin
          </button>

        </div>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* DESKTOP TABLE */}
      {/* ================================================= */}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50">

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Username
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Permissions
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {admins.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center text-sm text-slate-400"
                  >
                    No sub admins found.
                  </td>
                </tr>

              ) : (

                admins.map((admin) => (

                  <tr
                    key={admin.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* USERNAME */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                          {String(
                            admin.username ||
                              "A"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-bold text-slate-800">
                            {admin.username ||
                              "-"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            ID: {admin.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-4">

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">

                        <ShieldCheck
                          size={14}
                        />

                        {admin.role ||
                          "SUB_ADMIN"}

                      </span>

                    </td>

                    {/* PERMISSIONS */}

                    <td className="px-5 py-4">

                      <div className="flex max-w-[360px] flex-wrap gap-1.5">

                        {admin.permissions
                          ?.length ? (

                          admin.permissions.map(
                            (permission) => (
                              <span
                                key={
                                  permission
                                }
                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600"
                              >
                                {permission}
                              </span>
                            )
                          )

                        ) : (

                          <span className="text-xs text-slate-400">
                            No permissions
                          </span>

                        )}

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      {admin.isActive ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">

                          <UserCheck
                            size={14}
                          />

                          Active

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">

                          <UserX
                            size={14}
                          />

                          Inactive

                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admins/${admin.id}/edit`
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit Sub Admin"
                        >
                          <Edit3 size={16} />
                        </button>

                        {/* RESET PASSWORD */}

                        <button
                          type="button"
                          onClick={() =>
                            openResetPassword(
                              admin
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Reset Password"
                        >
                          <KeyRound
                            size={16}
                          />
                        </button>

                        {/* ACTIVATE / DEACTIVATE */}

                        {admin.isActive ? (

                          <button
                            type="button"
                            onClick={() =>
                              openStatusDialog(
                                admin
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Deactivate Sub Admin"
                          >
                            <UserX size={16} />
                          </button>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              openStatusDialog(
                                admin
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                            title="Activate Sub Admin"
                          >
                            <UserCheck
                              size={16}
                            />
                          </button>

                        )}

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteDialog(
                              admin
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                          title="Delete Sub Admin"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================================================= */}
      {/* MOBILE */}
      {/* ================================================= */}

      <div className="space-y-3 md:hidden">

        {admins.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center text-sm text-slate-400">
            No sub admins found.
          </div>

        ) : (

          admins.map((admin) => (

            <div
              key={admin.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >

              {/* TOP */}

              <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                    {String(
                      admin.username ||
                        "A"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-bold text-slate-900">
                      {admin.username ||
                        "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {admin.role ||
                        "SUB_ADMIN"}
                    </p>

                  </div>

                </div>

                {/* STATUS */}

                {admin.isActive ? (

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">

                    <UserCheck
                      size={13}
                    />

                    Active

                  </span>

                ) : (

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">

                    <UserX size={13} />

                    Inactive

                  </span>

                )}

              </div>

              {/* PERMISSIONS */}

              <div className="mt-4">

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Permissions
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">

                  {admin.permissions
                    ?.length ? (

                    admin.permissions.map(
                      (permission) => (
                        <span
                          key={
                            permission
                          }
                          className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600"
                        >
                          {permission}
                        </span>
                      )
                    )

                  ) : (

                    <span className="text-xs text-slate-400">
                      No permissions
                    </span>

                  )}

                </div>

              </div>

              {/* ACTIONS */}

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admins/${admin.id}/edit`
                    )
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Edit3 size={15} />

                  Edit
                </button>

                {/* RESET PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    openResetPassword(
                      admin
                    )
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <KeyRound
                    size={15}
                  />

                  Password
                </button>

                {/* ACTIVATE / DEACTIVATE */}

                {admin.isActive ? (

                  <button
                    type="button"
                    onClick={() =>
                      openStatusDialog(
                        admin
                      )
                    }
                    className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                    title="Deactivate Sub Admin"
                  >
                    <UserX size={17} />
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      openStatusDialog(
                        admin
                      )
                    }
                    className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                    title="Activate Sub Admin"
                  >
                    <UserCheck
                      size={17}
                    />
                  </button>

                )}

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    openDeleteDialog(
                      admin
                    )
                  }
                  className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                  title="Delete Sub Admin"
                >
                  <Trash2 size={17} />
                </button>

              </div>

            </div>

          ))

        )}

      </div>

      {/* ================================================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ================================================= */}

      {resetPasswordAdmin && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">

          <form
            onSubmit={
              handleResetPassword
            }
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >

            <div className="border-b border-slate-100 px-5 py-5">

              <h2 className="text-lg font-bold text-slate-900">
                Reset Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">

                Reset password for{" "}

                <strong>
                  {
                    resetPasswordAdmin.username
                  }
                </strong>

              </p>

            </div>

            <div className="p-5">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <input
                type="password"
                value={resetPassword}
                onChange={(event) =>
                  setResetPassword(
                    event.target.value
                  )
                }
                placeholder="Enter new password"
                autoFocus
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  closeResetPassword
                }
                disabled={resetLoading}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={resetLoading}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {resetLoading
                  ? "Updating..."
                  : "Reset Password"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* ================================================= */}
      {/* ACTIVATE / DEACTIVATE CONFIRMATION */}
      {/* ================================================= */}

      <ConfirmDialog
        open={
          confirmDialog.open
        }
        title={
          confirmDialog.action ===
          "activate"
            ? "Activate Sub Admin"
            : "Deactivate Sub Admin"
        }
        message={
          confirmDialog.action ===
          "activate"
            ? `Are you sure you want to activate ${confirmDialog.admin?.username}?`
            : `Are you sure you want to deactivate ${confirmDialog.admin?.username}?`
        }
        confirmText={
          confirmDialog.action ===
          "activate"
            ? "Activate"
            : "Deactivate"
        }
        onCancel={
          closeStatusDialog
        }
        onConfirm={
          handleActivateDeactivate
        }
      />

      {/* ================================================= */}
      {/* DELETE CONFIRMATION */}
      {/* ================================================= */}

      <ConfirmDialog
        open={
          deleteDialog.open
        }
        title="Delete Sub Admin"
        message={`Are you sure you want to permanently delete ${deleteDialog.admin?.username}? This action cannot be undone.`}
        confirmText={
          deleteLoading
            ? "Deleting..."
            : "Delete"
        }
        onCancel={
          closeDeleteDialog
        }
        onConfirm={
          handleDeleteSubAdmin
        }
      />

    </div>
  );
};

export default Admins;