import { useEffect, useState } from "react";

import {
  Check,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  changeAdminPassword,
  editSuperAdmin,
} from "../../services/adminApi";

import { useAuth } from "../../hooks/useAuth";


const Profile = () => {
  const {
    admin,
    refreshAdmin,
  } = useAuth();


  /* =========================================================
     USERNAME
  ========================================================== */

  const [username, setUsername] = useState("");


  /* =========================================================
     PASSWORD
  ========================================================== */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  /* =========================================================
     LOADING
  ========================================================== */

  const [usernameLoading, setUsernameLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);


  /* =========================================================
     MESSAGES
  ========================================================== */

  const [usernameMessage, setUsernameMessage] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [usernameError, setUsernameError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");


  /* =========================================================
     LOAD ADMIN DATA
  ========================================================== */

  useEffect(() => {
    if (admin?.username) {
      setUsername(admin.username);
    }
  }, [admin]);


  /* =========================================================
     UPDATE USERNAME
  ========================================================== */

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim()) {
      setUsernameError(
        "Username is required."
      );

      return;
    }

    try {
      setUsernameLoading(true);

      setUsernameError("");
      setUsernameMessage("");

      const response =
        await editSuperAdmin({
          username: username.trim(),
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update username"
        );
      }

      await refreshAdmin();

      setUsernameMessage(
        "Username updated successfully."
      );

    } catch (error) {
      console.error(
        "Update username error:",
        error
      );

      setUsernameError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update username."
      );

    } finally {
      setUsernameLoading(false);
    }
  };


  /* =========================================================
     CHANGE PASSWORD
  ========================================================== */

  const handlePasswordSubmit = async (
    event
  ) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");


    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );

      return;
    }


    if (!newPassword) {
      setPasswordError(
        "New password is required."
      );

      return;
    }


    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );

      return;
    }


    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );

      return;
    }


    try {
      setPasswordLoading(true);

      const response =
        await changeAdminPassword({
          currentPassword,
          newPassword,
        });


      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to change password"
        );
      }


      setPasswordMessage(
        "Password changed successfully."
      );


      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to change password."
      );

    } finally {
      setPasswordLoading(false);
    }
  };


  return (
    <div>

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Profile & Security
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your administrator profile and account security.
        </p>
      </div>


      {/* =====================================================
          PROFILE CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">


        {/* ===================================================
            ADMIN PROFILE
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}

          <div className="border-b border-slate-100 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Administrator Profile
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update your administrator username.
                </p>

              </div>

            </div>

          </div>


          {/* Body */}

          <form
            onSubmit={handleUsernameSubmit}
            className="p-5"
          >

            {/* Error */}

            {usernameError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {usernameError}
              </div>
            )}


            {/* Success */}

            {usernameMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                <Check size={16} />

                {usernameMessage}
              </div>
            )}


            {/* Username */}

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>

            <div className="relative">

              <UserRound
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(
                    event.target.value
                  );

                  setUsernameError("");
                  setUsernameMessage("");
                }}
                placeholder="Enter username"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* Role */}

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={18}
                  className="text-blue-600"
                />

                <div>

                  <p className="text-xs text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {admin?.role ||
                      "SUPER_ADMIN"}
                  </p>

                </div>

              </div>

            </div>


            {/* Save */}

            <button
              type="submit"
              disabled={usernameLoading}
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {usernameLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Save Changes
                </>
              )}

            </button>

          </form>

        </div>


        {/* ===================================================
            PASSWORD
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}

          <div className="border-b border-slate-100 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LockKeyhole size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Change Password
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update your administrator password.
                </p>

              </div>

            </div>

          </div>


          {/* Form */}

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 p-5"
          >

            {/* Error */}

            {passwordError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {passwordError}
              </div>
            )}


            {/* Success */}

            {passwordMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                <Check size={16} />

                {passwordMessage}
              </div>
            )}


            {/* Current Password */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Current Password
              </label>

              <div className="relative">

                <KeyRound
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(
                      event.target.value
                    );

                    setPasswordError("");
                  }}
                  placeholder="Enter current password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

            </div>


            {/* New Password */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(
                      event.target.value
                    );

                    setPasswordError("");
                  }}
                  placeholder="Enter new password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

            </div>


            {/* Confirm Password */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm New Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );

                    setPasswordError("");
                  }}
                  placeholder="Confirm new password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {passwordLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Updating...
                </>
              ) : (
                <>
                  <KeyRound size={17} />

                  Change Password
                </>
              )}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
};


export default Profile;