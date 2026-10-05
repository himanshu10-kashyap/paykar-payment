export const requirePermission = (
  permission
) =>
  async (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // ------------------------------------------------
      // SUPER ADMIN
      // ------------------------------------------------

      if (
        req.admin.role === "SUPER_ADMIN"
      ) {
        return next();
      }

      // ------------------------------------------------
      // SUB ADMIN PERMISSIONS
      // ------------------------------------------------

      const permissions = Array.isArray(
        req.admin.permissions
      )
        ? req.admin.permissions
        : [];

      // ALL_ACCESS gives access to everything
      if (
        permissions.includes("ALL_ACCESS")
      ) {
        return next();
      }

      // Specific permission
      if (
        !permissions.includes(permission)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error(
        "Permission middleware error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };