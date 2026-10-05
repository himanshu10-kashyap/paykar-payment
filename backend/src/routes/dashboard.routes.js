import express from "express";

import {
  getDashboard,
} from "../controllers/dashboard.controller.js";

import {
  authenticateAdmin,
} from "../middleware/auth.middleware.js";

import {
  requirePermission,
} from "../middleware/permission.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateAdmin,
  requirePermission("VIEW_DASHBOARD"),
  getDashboard
);

export default router;