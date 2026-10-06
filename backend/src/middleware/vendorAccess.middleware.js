import VendorSubadminAccess from "../models/VendorSubadminAccess.js";

const getCurrentAdmin = (req) => {
  return req.admin || req.user;
};

const getRole = (admin) => {
  return String(admin?.role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

export const requireVendorAccess = async (req, res, next) => {
  try {
    const admin = getCurrentAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const role = getRole(admin);

    console.log(
      "🔐 Vendor Access Check:",
      {
        adminId: admin.id,
        role,
        vendorId: req.params.id,
      }
    );

    if (role === "SUPER_ADMIN") {
      console.log(
        "✅ Super Admin - Vendor access allowed"
      );

      return next();
    }

    const isSubAdmin =
      role === "SUB_ADMIN" ||
      role === "SUBADMIN";

    if (!isSubAdmin) {
      console.log(
        "❌ Invalid admin role:",
        role
      );

      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this vendor",
      });
    }

    const vendorId = req.params.id;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    console.log(
      "🔎 Checking vendor access:",
      {
        vendorId,
        subadminId: admin.id,
      }
    );

    const access =
      await VendorSubadminAccess.findOne({
        where: {
          vendorId: vendorId,
          subadminId: admin.id,
        },
      });

    console.log(
      "🔎 Vendor access record:",
      access?.toJSON?.() || access
    );

    if (!access) {
      console.log(
        "❌ Sub Admin does not have access to vendor"
      );

      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this vendor",
      });
    }

    console.log(
      "✅ Sub Admin vendor access granted"
    );

    return next();

  } catch (error) {
    console.error(
      "❌ Vendor access middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify vendor access",
    });
  }
};