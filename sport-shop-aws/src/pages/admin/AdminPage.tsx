import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout Components
import { AdminSidebar } from "@/features/admin/layout/AdminSidebar";
import { AdminSecondarySidebar } from "@/features/admin/layout/AdminSecondarySidebar";
import { AdminHeader } from "@/features/admin/layout/AdminHeader";
import { AdminDashboardContent } from "@/features/admin/dashboard/AdminDashboardContent";

// ❌ BỎ hoàn toàn hệ chat mới
// import { useAdminChat } from "@/features/admin/chat/hooks/useAdminChat";
// import { ChatWindow } from "@/features/admin/chat/components/ChatWindow";
// import { ImagePreviewModal } from "@/features/admin/chat/components/ImagePreviewModal";

export default function AdminDashboard() {
  const [activePrimary, setActivePrimary] = useState<"system" | "chat">(
    "system"
  );
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const navigate = useNavigate();

  // ⭐ Khi chuyển tab chat -> chuyển sang legacy-chat
  useEffect(() => {
    if (activePrimary === "chat") {
      navigate("/admin/legacy-chat");
    }
  }, [activePrimary, navigate]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <TooltipProvider>
        {/* Sidebar chính */}
        <AdminSidebar
          activePrimary={activePrimary}
          setActivePrimary={setActivePrimary}
          unreadCount={0} // Không dùng hệ chat mới → bỏ unread
        />

        {/* Sidebar phụ (context menu) */}
        <AdminSecondarySidebar
          activePrimary={activePrimary}
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          rooms={[]} // Không dùng rooms của hệ chat mới
          selectedRoomId={0}
          onSelectRoom={() => {}}
        />

        {/* Main area */}
        <main className="flex-1 bg-slate-50/50 dark:bg-slate-950 flex flex-col min-w-0">
          <AdminHeader activePrimary={activePrimary} selectedRoomId={0} />

          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            {activePrimary === "system" && (
              <AdminDashboardContent selectedMenu={selectedMenu} />
            )}

            {activePrimary === "chat" && (
              <div className="text-sm text-slate-500">
                Đang chuyển sang trang chat...
              </div>
            )}
          </div>
        </main>
      </TooltipProvider>
    </div>
  );
}
