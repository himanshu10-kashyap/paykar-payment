export const PERMISSIONS = {
  ALL_ACCESS: "ALL_ACCESS",

  // =========================================================
  // DASHBOARD
  // =========================================================

  VIEW_DASHBOARD: "VIEW_DASHBOARD",

  // =========================================================
  // PAYMENTS
  // =========================================================

  VIEW_PAYMENTS: "VIEW_PAYMENTS",
  VIEW_PAYMENT_DETAILS: "VIEW_PAYMENT_DETAILS",
  CREATE_PAYMENT: "CREATE_PAYMENT",

  // =========================================================
  // ADMINS
  // =========================================================

  VIEW_ADMINS: "VIEW_ADMINS",

  CREATE_SUB_ADMIN: "CREATE_SUB_ADMIN",

  EDIT_SUB_ADMIN: "EDIT_SUB_ADMIN",

  RESET_SUB_ADMIN_PASSWORD:
    "RESET_SUB_ADMIN_PASSWORD",

  ACTIVATE_SUB_ADMIN:
    "ACTIVATE_SUB_ADMIN",

  DEACTIVATE_SUB_ADMIN:
    "DEACTIVATE_SUB_ADMIN",

  EDIT_SUPER_ADMIN:
    "EDIT_SUPER_ADMIN",

  RESET_SUPER_ADMIN_PASSWORD:
    "RESET_SUPER_ADMIN_PASSWORD",

  // =========================================================
  // VENDORS
  // =========================================================

  VIEW_VENDORS: "VIEW_VENDORS",

  CREATE_VENDOR: "CREATE_VENDOR",

  EDIT_VENDOR: "EDIT_VENDOR",

  ACTIVATE_VENDOR: "ACTIVATE_VENDOR",

  DEACTIVATE_VENDOR: "DEACTIVATE_VENDOR",

  DELETE_VENDOR: "DELETE_VENDOR",

  VIEW_VENDOR_PAYMENTS:
    "VIEW_VENDOR_PAYMENTS",
};


export const PERMISSION_LABELS = {
  ALL_ACCESS: "All Access",

  VIEW_DASHBOARD:
    "View Dashboard",

  VIEW_PAYMENTS:
    "View Payments",

  VIEW_PAYMENT_DETAILS:
    "View Payment Details",

  CREATE_PAYMENT:
    "Create Payment",

  VIEW_ADMINS:
    "View Administrators",

  CREATE_SUB_ADMIN:
    "Create Sub Admin",

  EDIT_SUB_ADMIN:
    "Edit Sub Admin",

  RESET_SUB_ADMIN_PASSWORD:
    "Reset Sub Admin Password",

  ACTIVATE_SUB_ADMIN:
    "Activate Sub Admin",

  DEACTIVATE_SUB_ADMIN:
    "Deactivate Sub Admin",

  EDIT_SUPER_ADMIN:
    "Edit Super Admin",

  RESET_SUPER_ADMIN_PASSWORD:
    "Reset Super Admin Password",

  VIEW_VENDORS:
    "View Vendors",

  CREATE_VENDOR:
    "Create Vendor",

  EDIT_VENDOR:
    "Edit Vendor",

  ACTIVATE_VENDOR:
    "Activate Vendor",

  DEACTIVATE_VENDOR:
    "Deactivate Vendor",

  DELETE_VENDOR:
    "Delete Vendor",

  VIEW_VENDOR_PAYMENTS:
    "View Vendor Payments",
};


export const ROUTES = {
  LOGIN: "/login",

  DASHBOARD: "/",

  PAYMENTS: "/payments",

  PAYMENT_DETAILS:
    "/payments/:id",

  VENDORS: "/vendors",

  CREATE_VENDOR:
    "/vendors/create",

  EDIT_VENDOR:
    "/vendors/:id/edit",

  VENDOR_PAYMENTS:
    "/vendors/:id/payments",

  ADMINS: "/admins",

  CREATE_SUB_ADMIN:
    "/admins/create",

  EDIT_SUB_ADMIN:
    "/admins/:id/edit",

  PROFILE: "/profile",

  // NEW
  VENDOR_ACCESS:
    "/vendors/:id/access",
};