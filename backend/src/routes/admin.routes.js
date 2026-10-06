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
  deleteSubAdmin,
} from "../controllers/admin.controller.js";
import { authenticateAdmin, requireSuperAdmin } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = express.Router();

router.get("/me", authenticateAdmin, getCurrentAdmin);

router.post("/login", loginAdmin);

router.post("/change-password", authenticateAdmin, changePassword);

router.get("/", authenticateAdmin, requireSuperAdmin, getAdmins);

router.post("/sub-admin", authenticateAdmin, requireSuperAdmin, createSubAdmin);

router.put("/sub-admin/:id", authenticateAdmin, requireSuperAdmin, editSubAdmin);

router.patch("/sub-admin/:id/reset-password", authenticateAdmin, requireSuperAdmin, resetSubAdminPassword);

router.put("/super-admin", authenticateAdmin, requireSuperAdmin, editSuperAdmin);

router.patch("/sub-admin/:id/activate", authenticateAdmin, requireSuperAdmin, activateSubAdmin);

router.patch("/sub-admin/:id/deactivate", authenticateAdmin, requireSuperAdmin, deactivateSubAdmin);

router.delete("/sub-admin/:id", authenticateAdmin, requireSuperAdmin, deleteSubAdmin);

export default router;