import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/ui/admin/Header";
import Sidebar from "@/components/ui/admin/Sidebar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((value) => !value)} />

        <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
          <div className="min-h-70 rounded-lg bg-surface p-5 shadow-sm ring-1 ring-black/5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
