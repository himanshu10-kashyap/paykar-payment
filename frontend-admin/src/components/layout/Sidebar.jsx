import { useState } from "react";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Store,
  UserRound,
  Users,
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


const Sidebar = () => {

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


  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-slate-800 bg-[#020617] lg:block">

      <div className="flex h-full flex-col">


        {/* =================================================
            LOGO
        ================================================== */}

        <div className="flex h-[72px] items-center border-b border-slate-800 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/20">
              <span className="font-black text-white">
                P
              </span>
            </div>

            <div>

              <div className="font-bold tracking-wide text-white">
                PAYKAR
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
                Admin Panel
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Main Menu
          </p>


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
                    className={({
                      isActive,
                    }) =>
                      [
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",

                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white",
                      ].join(" ")
                    }
                  >

                    <Icon size={19} />

                    <span>
                      {item.label}
                    </span>

                  </NavLink>
                );

              })}

          </nav>

        </div>


        {/* =================================================
            ADMIN PROFILE + LOGOUT
        ================================================== */}

        <div className="border-t border-slate-800 p-4">


          {/* Profile */}

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="mb-3 flex w-full items-center gap-3 rounded-xl bg-slate-900 p-3 text-left transition hover:bg-slate-800"
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {admin?.username
                ?.charAt(0)
                ?.toUpperCase() ||
                "A"}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-white">
                {admin?.username ||
                  "Administrator"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {admin?.role ||
                  "Admin"}
              </p>

            </div>

          </button>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.98]"
          >

            <LogOut
              size={18}
              className="shrink-0"
            />

            <span>
              Logout
            </span>

          </button>

        </div>


        {/* =================================================
            LOGOUT MODAL
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

      </div>

    </aside>
  );
};


export default Sidebar;