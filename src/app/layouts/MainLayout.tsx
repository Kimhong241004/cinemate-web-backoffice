import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import Sidebar from "../components/shared/Sidebar";
import Navbar from "../components/shared/Navbar";
import ToastContainer from "../components/shared/ToastContainer";
import { ProfileProvider } from "../context/ProfileContext";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarCollapse = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setIsSidebarCollapsed(customEvent.detail);
    };

    document.addEventListener("sidebarCollapse", handleSidebarCollapse);
    return () =>
      document.removeEventListener("sidebarCollapse", handleSidebarCollapse);
  }, []);

  return (
    <ProfileProvider>
      <div className="h-screen overflow-hidden bg-[#0a0a0a]">
        <Sidebar />
        <Navbar />

        <main
          className={`
          pt-16 sm:pt-20 h-screen overflow-y-auto transition-all duration-300
          ml-0
          ${isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[255px]"}
        `}
        >
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        <ToastContainer />
      </div>
    </ProfileProvider>
  );
};

export default MainLayout;
