import express from "express";
import {
    createVendor,
    getVendors,
    getVendor,
    getVendorBySlug,
    editVendor,
    activateVendor,
    deactivateVendor,
    deleteVendor,
    getVendorPayments,
} from "../controllers/vendor.controller.js";
import { authenticateAdmin, requireSuperAdmin } from "../middleware/auth.middleware.js";
import { requireVendorAccess } from "../middleware/vendorAccess.middleware.js";


const router = express.Router();


router.get("/public/:slug", getVendorBySlug);

router.get("/", authenticateAdmin, getVendors);

router.get("/:id/payments", authenticateAdmin, requireVendorAccess, getVendorPayments);

router.get("/:id", authenticateAdmin, requireVendorAccess, getVendor);

router.post("/", authenticateAdmin, requireSuperAdmin, createVendor);

router.put("/:id", authenticateAdmin, requireSuperAdmin, editVendor);

router.patch("/:id/activate", authenticateAdmin, requireSuperAdmin, activateVendor);

router.patch("/:id/deactivate", authenticateAdmin, requireSuperAdmin, deactivateVendor);

router.delete("/:id", authenticateAdmin, requireSuperAdmin, deleteVendor);


export default router;