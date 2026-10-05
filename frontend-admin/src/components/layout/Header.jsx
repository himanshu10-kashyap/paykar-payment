import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";


const Header = ({
  onMenuClick,
}) => {

  const {
    admin,
  } = useAuth();

  const navigate =
    useNavigate();


  const openProfile = () => {
    navigate("/profile");
  };


  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">


        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="flex items-center gap-3">

          {/* Mobile menu */}

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu size={20} />
          </button>


          {/* Page information */}

          <div className="hidden sm:block">

            <p className="text-sm font-semibold text-slate-900">
              Admin Dashboard
            </p>

            <p className="text-xs text-slate-400">
              Manage your payment platform
            </p>

          </div>

        </div>


        {/* ===================================================
            RIGHT
        ==================================================== */}

        <div className="flex items-center gap-3">


          {/* Notification */}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >

            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />

          </button>


          {/* Divider */}

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />


          {/* Admin profile */}

          <button
            type="button"
            onClick={openProfile}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
          >

            {/* Avatar */}

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
              {admin?.username
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </div>


            {/* Name */}

            <div className="hidden text-left sm:block">

              <p className="max-w-[120px] truncate text-sm font-semibold text-slate-800">
                {admin?.username ||
                  "Admin"}
              </p>

              <p className="text-xs text-slate-400">
                {admin?.role ||
                  "Administrator"}
              </p>

            </div>


            {/* Arrow */}

            <ChevronDown
              size={16}
              className="hidden text-slate-400 sm:block"
            />

          </button>

        </div>

      </div>

    </header>
  );
};


export default Header;