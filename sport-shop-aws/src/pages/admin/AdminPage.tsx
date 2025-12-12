import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout Components
import { AdminSidebar } from "@/features/admin/layout/AdminSidebar";
import { AdminSecondarySidebar } from "@/features/admin/layout/AdminSecondarySidebar";
import { AdminHeader } from "@/features/admin/layout/AdminHeader";
import { AdminDashboardContent } from "@/features/admin/dashboard/AdminDashboardContent";

// Legacy Chat Components
import { useLegacyAdminChat } from "@/features/admin/chat/hooks/useLegacyAdminChat";
import { ChatWindow } from "@/features/admin/chat/components/ChatWindow";

export default function AdminDashboard() {
  const location = useLocation();

  // State: Tab chính (System vs Chat)
  const [activePrimary, setActivePrimary] = useState<"system" | "chat">(
    "system"
  );
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  // Update selectedMenu based on URL
  useEffect(() => {
    const path = location.pathname;
    console.log("🔍 AdminPage - Pathname changed:", path);
    
    if (path.startsWith("/admin/products")) {
      setSelectedMenu("products");
    } else if (path.startsWith("/admin/orders")) {
      setSelectedMenu("orders");
    } else if (path.startsWith("/admin/users")) {
      setSelectedMenu("users");
    } else if (path.startsWith("/admin/categories")) {
      setSelectedMenu("categories");
    } else if (path.startsWith("/admin/brands")) {
      setSelectedMenu("brands");
    } else if (path.startsWith("/admin/sports")) {
      setSelectedMenu("sports");
    } else if (path.startsWith("/admin/audiences")) {
      setSelectedMenu("audiences");
    } else if (path.startsWith("/admin/attributes")) {
      setSelectedMenu("attributes");
    } else if (path.startsWith("/admin/colors")) {
      setSelectedMenu("colors");
    } else if (path.startsWith("/admin/sizes")) {
      setSelectedMenu("sizes");
    } else if (path === "/admin" || path === "/admin/") {
      setSelectedMenu("dashboard");
    }
  }, [location.pathname]);

  // Legacy Chat Hook
  const {
    rooms,
    selectedRoomId,
    selectRoom,
    messages,
    text,
    setText,
    pendingFile,
    setPendingFile,
    previewImage,
    setPreviewImage,
    sendMessage,
    handleFileChange,
  } = useLegacyAdminChat();

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
          rooms={activePrimary === "chat" ? rooms : []}
          selectedRoomId={activePrimary === "chat" ? selectedRoomId : null}
          onSelectRoom={activePrimary === "chat" ? selectRoom : () => {}}
        />

        {/* Main area */}
        <main className="flex-1 bg-slate-50/50 dark:bg-slate-950 flex flex-col min-w-0">
          <AdminHeader
            activePrimary={activePrimary}
            selectedRoomId={activePrimary === "chat" ? selectedRoomId : null}
          />

          <div className="flex-1 overflow-hidden flex flex-col">
            {activePrimary === "system" && (
              <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <AdminDashboardContent selectedMenu={selectedMenu} />
              </div>
            )}

            {activePrimary === "chat" && (
              <ChatWindow
                selectedRoomId={selectedRoomId}
                messages={messages}
                text={text}
                setText={setText}
                pendingFile={pendingFile}
                setPendingFile={setPendingFile}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                onSend={sendMessage}
                onFileChange={handleFileChange}
              />
            )}
          </div>
        </main>
      </TooltipProvider>
    </div>
  );
}
