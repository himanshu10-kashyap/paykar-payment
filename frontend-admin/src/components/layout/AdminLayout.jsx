import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";

import { Outlet } from "react-router-dom";


const AdminLayout = () => {

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Desktop */}

      <Sidebar />


      {/* Mobile */}

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />


      {/* Main */}

      <div className="lg:pl-[270px]">

        <Header
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />


        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-7">

          <Outlet />

        </main>

      </div>

    </div>
  );
};


export default AdminLayout;