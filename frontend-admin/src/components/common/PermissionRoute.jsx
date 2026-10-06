import { Navigate } from "react-router-dom";

import AccessDenied from "./AccessDenied";

import {
  PERMISSIONS,
} from "../../constants/permissions";

// --------------------------------------------------
// Get logged-in admin
// --------------------------------------------------

const getLoggedInAdmin = () => {
  try {

    const storedAdmin =
      localStorage.getItem("admin") ||
      localStorage.getItem("user") ||
      localStorage.getItem("authUser");

    if (!storedAdmin) {
      return null;
    }

    return JSON.parse(storedAdmin);
  } catch (error) {
    console.error(
      "Failed to read logged-in admin:",
      error
    );

    return null;
  }
};

// --------------------------------------------------
// Permission Route
// --------------------------------------------------

const PermissionRoute = ({
  permission,
  children,
  fallback = null,
}) => {
  const admin = getLoggedInAdmin();

  // ------------------------------------------------
  // Not logged in
  // ------------------------------------------------

  if (!admin) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ------------------------------------------------
  // SUPER ADMIN
  //
  // Super admin always has access.
  // ------------------------------------------------

  const isSuperAdmin =
    String(admin?.role || "").toUpperCase() ===
    "SUPER_ADMIN";

  if (isSuperAdmin) {
    return children;
  }

  // ------------------------------------------------
  // SUB ADMIN / NORMAL ADMIN
  // ------------------------------------------------

  const permissions =
    Array.isArray(admin?.permissions)
      ? admin.permissions
      : [];

  const hasPermission =
    permissions.includes(permission);

  // ------------------------------------------------
  // Permission exists
  // ------------------------------------------------

  if (hasPermission) {
    return children;
  }

  // ------------------------------------------------
  // No permission
  // ------------------------------------------------

  if (fallback) {
    return fallback;
  }

  return (
    <AccessDenied
      title="Access Restricted"
      message="You do not have permission to access this page. Please contact your administrator if you need access."
      showBackButton
      showDashboardButton={false}
    />
  );
};

export default PermissionRoute;