import { useAuth } from "./useAuth";

export const usePermission = () => {
  const { admin } = useAuth();

  const hasPermission = (permission) => {
    if (!admin) {
      return false;
    }

    const role = String(admin.role || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    // SUPER ADMIN ALWAYS HAS ACCESS
    if (role === "SUPER_ADMIN") {
      return true;
    }

    const permissions = Array.isArray(admin.permissions)
      ? admin.permissions
      : [];

    // Full access
    if (
      permissions.includes("ALL_ACCESS") ||
      permissions.includes("all") ||
      permissions.includes("*")
    ) {
      return true;
    }

    return permissions.includes(permission);
  };

  return {
    hasPermission,
  };
};