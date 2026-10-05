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
import { authenticateAdmin } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";


const router = express.Router();


router.get("/public/:slug", getVendorBySlug);

router.get("/", authenticateAdmin, requirePermission("VIEW_VENDORS"), getVendors);

router.get("/:id/payments", authenticateAdmin, requirePermission("VIEW_VENDOR_PAYMENTS"), getVendorPayments);

router.get("/:id", authenticateAdmin, requirePermission("VIEW_VENDORS"), getVendor);

router.post("/", authenticateAdmin, requirePermission("CREATE_VENDOR"), createVendor);

router.put("/:id", authenticateAdmin, requirePermission("EDIT_VENDOR"), editVendor);

router.patch("/:id/activate", authenticateAdmin, requirePermission("ACTIVATE_VENDOR"), activateVendor);

router.patch("/:id/deactivate", authenticateAdmin, requirePermission("DEACTIVATE_VENDOR"), deactivateVendor);

router.delete("/:id", authenticateAdmin, requirePermission("DELETE_VENDOR"), deleteVendor);


export default router;