import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiSidebar,
  FiPlus,
  FiFileText,
  FiStar,
  FiMap,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { GiArtificialHive, GiTwoCoins } from "react-icons/gi";
import api from "../utils/axios";

const navItems = [
  {
    icon: <FiFileText />,
    label: "Resume Builder",
    path: "/resume",
  },
  {
    icon: <FiStar />,
    label: "Resume Scorer",
    path: "/scorer",
  },
  {
    icon: <FiMap />,
    label: "Roadmap Builder",
    path: "/roadmap",
  },
];

function Sidebar({
  user,
  onNewInterview,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
}) 
{
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/auth/logout");

      if (response.data?.success) {
        if (onLogout) {
          onLogout();
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };


//    it is a component
  const SidebarInner = () => (
    <div className="flex h-full flex-col">
      {/* Logo and sidebar toggle */}
      <div
        className={`flex h-[68px] shrink-0 items-center border-b border-black/10 px-3 ${
          sidebarOpen ? "justify-between" : "justify-center"
        }`}
      >
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2.5"
          > 
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
              <GiArtificialHive size={19} color="white" />
            </div>

            <span className="whitespace-nowrap text-sm font-extrabold tracking-tight text-black">
              Multi.AI
            </span>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="hidden shrink-0 cursor-pointer text-black/40 transition-colors hover:text-black md:flex"
          aria-label="Toggle sidebar"
        >
          <FiSidebar size={15} />
        </motion.button>

        {!sidebarOpen && (
          <div className="md:hidden">
            <GiArtificialHive size={22} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="cursor-pointer text-black/50 md:hidden"
          aria-label="Close mobile sidebar"
        >
          <FiX size={19} />
        </button>
      </div>

      {/* Create interview */}
      <div className="shrink-0 px-2.5 pb-1.5 pt-3">
        <motion.button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            onNewInterview
              ? onNewInterview()
              : navigate("/interview");
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex w-full cursor-pointer items-center rounded-lg bg-black py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all hover:bg-black/80 ${
            sidebarOpen
              ? "justify-start gap-2.5 px-3"
              : "justify-center px-0"
          }`}
          title={!sidebarOpen ? "Create Interview" : ""}
        >
          <FiPlus size={16} className="shrink-0" />

          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.13 }}
                className="whitespace-nowrap text-xs"
              >
                Create Interview
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Agents heading */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.13 }}
            className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-widest text-black/50"
          >
            Agents
          </motion.p>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-1">
        {navItems.map((item) => (
          <motion.button
            key={item.path}
            type="button"
            onClick={() => handleNavigate(item.path)}
            whileHover={{ x: 2 }}
            className={`group flex w-full cursor-pointer items-center rounded-lg py-2.5 text-black/45 transition-colors hover:bg-black/5 hover:text-black ${
              sidebarOpen
                ? "justify-start gap-3 px-2.5"
                : "justify-center px-0"
            }`}
            title={!sidebarOpen ? item.label : ""}
          >
            <span className="shrink-0 text-base">
              {item.icon}
            </span>

            {sidebarOpen && (
              <span className="whitespace-nowrap text-xs font-medium">
                {item.label}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-black/10 p-2.5">
        {/* Interview coins */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.13 }}
              onClick={() => handleNavigate("/billing")}
              className="group mb-2 flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-black/90 px-2.5 py-2.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all hover:border-white/20"
            >
              <div className="flex items-center gap-2">
                <GiTwoCoins
                  size={16}
                  className="shrink-0 text-yellow-400"
                />

                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-white/50">
                    Interview Coins
                  </span>

                  <span className="text-xs font-bold">
                    {user?.interviewCoin}
                  </span>
                </div>
              </div>

              <FaCirclePlus className="text-base text-white/70 transition-transform group-hover:scale-110" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* User profile */}
        <div
          className={`flex items-center gap-2.5 rounded-lg py-2 ${
            sidebarOpen ? "px-1" : "justify-center"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {sidebarOpen && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-black">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-[10px] text-black/40">
                  {user?.email || ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="shrink-0 cursor-pointer rounded-md p-1.5 text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <FiLogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

   return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-hidden border-r border-black/10 bg-white font-sans text-black md:flex"
      >
        <SidebarInner />
      </motion.aside>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-lg border border-black/10 bg-white p-2 text-black shadow-sm md:hidden"
        aria-label="Open sidebar"
      >
        <FiSidebar size={19} />
      </button>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col overflow-hidden border-r border-black/10 bg-white font-sans text-black md:hidden "
            >
              <SidebarInner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
    
  )
}

export default Sidebar;