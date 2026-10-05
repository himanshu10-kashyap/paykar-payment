import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";

import ProtectedRoute from "./components/common/ProtectedRoute";
import PermissionRoute from "./components/common/PermissionRoute";

import AdminLayout from "./components/layout/AdminLayout";

import Dashboard from "./pages/dashboard/Dashboard";

import Payments from "./pages/payments/Payments";
import PaymentDetails from "./pages/payments/PaymentDetails";

import Vendors from "./pages/vendors/Vendors";
import CreateVendor from "./pages/vendors/CreateVendor";
import EditVendor from "./pages/vendors/EditVendor";
import VendorPayments from "./pages/vendors/VendorPayments";

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

      {/* ================================================= */}
      {/* LOGIN */}
      {/* ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ================================================= */}
      {/* PROTECTED ADMIN AREA */}
      {/* ================================================= */}

      <Route element={<ProtectedRoute />}>

        <Route element={<AdminLayout />}>

          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          <Route
            path="/dashboard"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_DASHBOARD
                }
              >
                <Dashboard />
              </PermissionRoute>
            }
          />


          {/* ================================================= */}
          {/* PAYMENTS */}
          {/* ================================================= */}

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


          {/* ================================================= */}
          {/* VENDORS */}
          {/* ================================================= */}

          <Route
            path="/vendors"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_VENDORS
                }
              >
                <Vendors />
              </PermissionRoute>
            }
          />

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

          <Route
            path="/vendors/:id/payments"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.VIEW_VENDOR_PAYMENTS
                }
              >
                <VendorPayments />
              </PermissionRoute>
            }
          />


          {/* ================================================= */}
          {/* ADMINS */}
          {/* ================================================= */}

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


          {/* ================================================= */}
          {/* CREATE SUB ADMIN */}
          {/* ================================================= */}

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


          {/* ================================================= */}
          {/* EDIT SUB ADMIN */}
          {/* ================================================= */}

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


          {/* ================================================= */}
          {/* PROFILE */}
          {/* ================================================= */}

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

      </Route>


      {/* ================================================= */}
      {/* DEFAULT */}
      {/* ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* ================================================= */}
      {/* UNKNOWN */}
      {/* ================================================= */}

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