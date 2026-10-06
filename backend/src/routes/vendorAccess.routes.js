import express from "express";
import {
  assignVendorToSubadmin,
  removeVendorFromSubadmin,
  getVendorSubadmins,
  getSubadminVendors,
} from "../controllers/vendorAccess.controller.js";
import {
  authenticateAdmin,
  requireSuperAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/vendors/:vendorId/subadmins/:subadminId", authenticateAdmin, requireSuperAdmin, assignVendorToSubadmin);

router.delete("/vendors/:vendorId/subadmins/:subadminId", authenticateAdmin, requireSuperAdmin, removeVendorFromSubadmin);

router.get("/vendors/:vendorId/subadmins", authenticateAdmin, requireSuperAdmin, getVendorSubadmins);

router.get("/subadmins/:subadminId/vendors", authenticateAdmin, requireSuperAdmin, getSubadminVendors);


export default router;