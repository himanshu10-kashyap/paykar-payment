import Vendor from "../models/Vendor.js";
import VendorSubadminAccess from "../models/VendorSubadminAccess.js";
import Admin from "../models/Admin.js";

export const assignVendorToSubadmin = async (
  req,
  res
) => {
  try {
    const {
      vendorId,
      subadminId,
    } = req.params;

    if (!vendorId || !subadminId) {
      return res.status(400).json({
        success: false,
        message:
          "Vendor ID and Subadmin ID are required",
      });
    }

    const vendor =
      await Vendor.findByPk(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const subadmin =
      await Admin.findByPk(subadminId);

    if (!subadmin) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    const role = String(
      subadmin.role || ""
    )
      .trim()
      .toUpperCase();

    const validSubAdmin =
      role === "SUB_ADMIN" ||
      role === "SUBADMIN";

    if (!validSubAdmin) {
      return res.status(400).json({
        success: false,
        message:
          "Selected user is not a subadmin",
      });
    }

    const existingAccess =
      await VendorSubadminAccess.findOne({
        where: {
          vendorId,
          subadminId,
        },
      });

    if (existingAccess) {
      return res.status(409).json({
        success: false,
        message:
          "Subadmin already has access to this vendor",
      });
    }

    const access =
      await VendorSubadminAccess.create({
        vendorId,
        subadminId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Vendor access assigned successfully",
      data: access,
    });
  } catch (error) {
    console.error(
      "❌ Assign vendor access error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to assign vendor access",
      error: error.message,
    });
  }
};


export const removeVendorFromSubadmin = async (
  req,
  res
) => {
  try {
    const {
      vendorId,
      subadminId,
    } = req.params;

    if (!vendorId || !subadminId) {
      return res.status(400).json({
        success: false,
        message:
          "Vendor ID and Subadmin ID are required",
      });
    }

    const access =
      await VendorSubadminAccess.findOne({
        where: {
          vendorId,
          subadminId,
        },
      });

    if (!access) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor access not found",
      });
    }

    await access.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Vendor access removed successfully",
    });
  } catch (error) {
    console.error(
      "❌ Remove vendor access error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove vendor access",
      error: error.message,
    });
  }
};

export const getVendorSubadmins = async (
  req,
  res
) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const vendor =
      await Vendor.findByPk(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const accessRows =
      await VendorSubadminAccess.findAll({
        where: {
          vendorId,
        },
      });

    return res.status(200).json({
      success: true,
      data: accessRows,
    });
  } catch (error) {
    console.error(
      "❌ Get vendor subadmins error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get vendor subadmins",
      error: error.message,
    });
  }
};

export const getSubadminVendors = async (req, res) => {
  try {
    const { subadminId } = req.params;

    if (!subadminId) {
      return res.status(400).json({
        success: false,
        message: "Subadmin ID is required",
      });
    }

    const subadmin = await Admin.findByPk(
      subadminId
    );

    if (!subadmin) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    const role = String(
      subadmin.role || ""
    )
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    const isSubadmin =
      role === "SUB_ADMIN" ||
      role === "SUBADMIN";

    if (!isSubadmin) {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a subadmin",
      });
    }

    const accessList =
      await VendorSubadminAccess.findAll({
        where: {
          subadminId,
        },
      });

    const vendorIds = accessList
      .map(
        (item) => item.vendorId
      )
      .filter(
        (vendorId) =>
          vendorId !== undefined &&
          vendorId !== null
      );

    let vendors = [];

    if (vendorIds.length > 0) {
      vendors = await Vendor.findAll({
        where: {
          id: vendorIds,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error(
      "❌ Get subadmin vendors error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get subadmin vendors",
      error: error.message,
    });
  }
};