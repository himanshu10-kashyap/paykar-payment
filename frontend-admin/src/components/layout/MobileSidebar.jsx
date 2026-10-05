import { useState } from "react";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Store,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import ConfirmDialog from "../common/ConfirmDialog";


const MobileSidebar = ({
  open,
  onClose,
}) => {

  const {
    admin,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  const [
    logoutModalOpen,
    setLogoutModalOpen,
  ] = useState(false);


  const canViewPayments =
    usePermission(
      PERMISSIONS.VIEW_PAYMENTS
    );

  const canViewVendors =
    usePermission(
      PERMISSIONS.VIEW_VENDORS
    );

  const canViewAdmins =
    usePermission(
      PERMISSIONS.VIEW_ADMINS
    );


  const handleLogout = () => {
    setLogoutModalOpen(true);
  };


  const confirmLogout = () => {
    setLogoutModalOpen(false);

    onClose();

    logout();

    navigate("/login", {
      replace: true,
    });
  };


  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };


  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },

    {
      label: "Payments",
      path: "/payments",
      icon: CreditCard,
      show: canViewPayments,
    },

    {
      label: "Vendors",
      path: "/vendors",
      icon: Store,
      show: canViewVendors,
    },

    {
      label: "Administrators",
      path: "/admins",
      icon: Users,
      show: canViewAdmins,
    },

    {
      label: "Profile",
      path: "/profile",
      icon: UserRound,
      show: true,
    },
  ];


  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[60] lg:hidden">


      {/* =================================================
          OVERLAY
      ================================================== */}

      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />


      {/* =================================================
          DRAWER
      ================================================== */}

      <aside className="absolute left-0 top-0 flex h-full w-[285px] flex-col bg-[#020617] shadow-2xl">


        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex h-[72px] items-center justify-between border-b border-slate-800 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <span className="font-black text-white">
                P
              </span>
            </div>

            <div>

              <p className="font-bold text-white">
                PAYKAR
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">
                Admin Panel
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>

        </div>


        {/* =================================================
            MENU
        ================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <nav className="space-y-1.5">

            {menuItems
              .filter(
                (item) => item.show
              )
              .map((item) => {

                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({
                      isActive,
                    }) =>
                      [
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",

                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white",
                      ].join(" ")
                    }
                  >

                    <Icon size={19} />

                    {item.label}

                  </NavLink>
                );

              })}

          </nav>

        </div>


        {/* =================================================
            ADMIN PROFILE
        ================================================== */}

        <div className="border-t border-slate-800 p-4">

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/profile");
            }}
            className="mb-3 flex w-full items-center gap-3 rounded-xl bg-slate-900 p-3 text-left"
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {admin?.username
                ?.charAt(0)
                ?.toUpperCase() ||
                "A"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-white">
                {admin?.username ||
                  "Admin"}
              </p>

              <p className="text-xs text-slate-500">
                {admin?.role ||
                  "Administrator"}
              </p>

            </div>

          </button>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >

            <LogOut
              size={18}
            />

            Logout

          </button>

        </div>


        {/* =================================================
            LOGOUT CONFIRMATION
        ================================================== */}

        <ConfirmDialog
          open={logoutModalOpen}
          title="Confirm Logout"
          message="Are you sure you want to logout from the Paykar admin panel?"
          confirmText="Yes, Logout"
          cancelText="Cancel"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />

      </aside>

    </div>
  );
};


export default MobileSidebar;