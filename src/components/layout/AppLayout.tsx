import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/stores/auth";
import { useLayout } from "@/stores/layout";
import type { UserRole } from "@/types";

export function AppLayout({ role }: { role: UserRole }) {
  const { mobileOpen, setMobileOpen } = useLayout();
  const { init } = useAuth();
  const hiddenX = document.documentElement.dir === "rtl" ? "-100%" : "100%";

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="aurora-bg flex h-screen overflow-hidden bg-background">
      <Sidebar role={role} />

      {/* درج التابلت/الموبايل */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: hiddenX }}
              animate={{ x: 0 }}
              exit={{ x: hiddenX }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="glass-strong fixed inset-y-0 end-0 z-50 w-72 border-s border-white/10 md:hidden"
            >
              <SidebarContent role={role} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="no-scrollbar flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
