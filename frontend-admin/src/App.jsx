import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";

import ProtectedRoute from "./components/common/ProtectedRoute";
import PermissionRoute from "./components/common/PermissionRoute";
import AccessDenied from "./components/common/AccessDenied";

import AdminLayout from "./components/layout/AdminLayout";

import Dashboard from "./pages/dashboard/Dashboard";

import Payments from "./pages/payments/Payments";
import PaymentDetails from "./pages/payments/PaymentDetails";

import Vendors from "./pages/vendors/Vendors";
import CreateVendor from "./pages/vendors/CreateVendor";
import EditVendor from "./pages/vendors/EditVendor";
import VendorPayments from "./pages/vendors/VendorPayments";
import VendorPaymentDetails from "./pages/vendors/VendorPaymentDetails";
import VendorAccess from "./pages/vendors/VendorAccess";

import Admins from "./pages/admins/Admins";
import CreateSubAdmin from "./pages/admins/CreateSubAdmin";
import EditSubAdmin from "./pages/admins/EditSubAdmin";

import Profile from "./pages/profile/Profile";

import {
  PERMISSIONS,
} from "./constants/permissions";

const App = () => {
  return (
    <Routes>

      {/* =================================================
          LOGIN
      ================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =================================================
          PROTECTED APPLICATION
      ================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route element={<AdminLayout />}>

          {/* =================================================
              DASHBOARD

              SUPER_ADMIN
              -> Always allowed

              SUB_ADMIN
              -> Only allowed with VIEW_DASHBOARD

              SUB_ADMIN WITHOUT PERMISSION
              -> Show proper access restricted screen
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_DASHBOARD
                }
                fallback={
                  <AccessDenied
                    title="Dashboard Access Restricted"
                    message="Your account does not have permission to view the dashboard. Please contact the administrator if you need dashboard access."
                    showBackButton={false}
                    showDashboardButton={false}
                  />
                }
              >
                <Dashboard />
              </PermissionRoute>
            }
          />

          {/* =================================================
              GENERIC PAYMENTS

              Sub Admin will NOT have this permission.
          ================================================== */}

          <Route
            path="/payments"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_PAYMENTS
                }
              >
                <Payments />
              </PermissionRoute>
            }
          />

          {/* =================================================
              GENERIC PAYMENT DETAILS
          ================================================== */}

          <Route
            path="/payments/:id"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_PAYMENT_DETAILS
                }
              >
                <PaymentDetails />
              </PermissionRoute>
            }
          />

          {/* =================================================
              VENDORS

              Sub Admin can access assigned vendors.
              Backend should restrict returned vendors.
          ================================================== */}

          <Route
            path="/vendors"
            element={
              <Vendors />
            }
          />

          {/* =================================================
              CREATE VENDOR
          ================================================== */}

          <Route
            path="/vendors/create"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_VENDOR
                }
              >
                <CreateVendor />
              </PermissionRoute>
            }
          />

          {/* =================================================
              EDIT VENDOR
          ================================================== */}

          <Route
            path="/vendors/:id/edit"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.EDIT_VENDOR
                }
              >
                <EditVendor />
              </PermissionRoute>
            }
          />

          {/* =================================================
              VENDOR PAYMENTS
          ================================================== */}

          <Route
            path="/vendors/:id/payments"
            element={
              <VendorPayments />
            }
          />

          {/* =================================================
              VENDOR PAYMENT DETAILS
          ================================================== */}

          <Route
            path="/vendors/:vendorId/payments/:paymentId"
            element={
              <VendorPaymentDetails />
            }
          />

          {/* =================================================
              VENDOR ACCESS

              Super Admin / permitted admin only.
          ================================================== */}

          <Route
            path="/vendors/:id/access"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_VENDORS
                }
              >
                <VendorAccess />
              </PermissionRoute>
            }
          />

          {/* =================================================
              ADMINISTRATORS
          ================================================== */}

          <Route
            path="/admins"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_ADMINS
                }
              >
                <Admins />
              </PermissionRoute>
            }
          />

          {/* =================================================
              CREATE SUB ADMIN
          ================================================== */}

          <Route
            path="/admins/create"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_SUB_ADMIN
                }
              >
                <CreateSubAdmin />
              </PermissionRoute>
            }
          />

          {/* =================================================
              EDIT SUB ADMIN
          ================================================== */}

          <Route
            path="/admins/:id/edit"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.EDIT_SUB_ADMIN
                }
              >
                <EditSubAdmin />
              </PermissionRoute>
            }
          />

          {/* =================================================
              PROFILE
          ================================================== */}

          <Route
            path="/profile"
            element={
              <Profile />
            }
          />

        </Route>

      </Route>

      {/* =================================================
          DEFAULT
      ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* =================================================
          UNKNOWN ROUTE
      ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
};

export default App;