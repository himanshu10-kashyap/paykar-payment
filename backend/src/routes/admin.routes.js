import express from "express";
import {
  loginAdmin,
  createSubAdmin,
  getAdmins,
  editSubAdmin,
  resetSubAdminPassword,
  changePassword,
  editSuperAdmin,
  getCurrentAdmin,
  activateSubAdmin,
  deactivateSubAdmin,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = express.Router();

router.get("/me", authenticateAdmin, getCurrentAdmin);

router.post("/login", loginAdmin);

router.post("/change-password", authenticateAdmin, changePassword);

router.get("/", authenticateAdmin, requirePermission("VIEW_ADMINS"), getAdmins);

router.post("/sub-admin", authenticateAdmin, requirePermission("CREATE_SUB_ADMIN"), createSubAdmin);

router.put("/sub-admin/:id", authenticateAdmin, requirePermission("EDIT_SUB_ADMIN"), editSubAdmin);

router.patch("/sub-admin/:id/reset-password", authenticateAdmin, requirePermission("RESET_SUB_ADMIN_PASSWORD"), resetSubAdminPassword);

router.put("/super-admin", authenticateAdmin, editSuperAdmin);

router.patch("/sub-admin/:id/activate", authenticateAdmin, requirePermission("ACTIVATE_SUB_ADMIN"), activateSubAdmin);

router.patch("/sub-admin/:id/deactivate", authenticateAdmin, requirePermission("DEACTIVATE_SUB_ADMIN"), deactivateSubAdmin);

export default router;