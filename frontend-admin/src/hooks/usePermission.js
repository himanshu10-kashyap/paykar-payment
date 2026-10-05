import { useAuth } from "./useAuth";

export const usePermission = () => {
  const { admin } = useAuth();

  const hasPermission = (
    permission
  ) => {
    if (!admin) {
      return false;
    }

    if (
      admin.role === "SUPER_ADMIN"
    ) {
      return true;
    }

    const permissions =
      Array.isArray(admin.permissions)
        ? admin.permissions
        : [];

    if (
      permissions.includes("ALL_ACCESS")
    ) {
      return true;
    }

    return permissions.includes(
      permission
    );
  };

  return {
    hasPermission,
  };
};