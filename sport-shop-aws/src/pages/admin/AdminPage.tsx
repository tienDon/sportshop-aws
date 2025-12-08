import React, { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Package,
  LogOut,
  ShoppingBag,
  Bell,
} from "lucide-react";

// Import Shadcn Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

// Chat Components & Hooks
import { useAdminChat } from "@/features/admin/chat/hooks/useAdminChat";
import { ChatRoomList } from "@/features/admin/chat/components/ChatRoomList";
import { ChatWindow } from "@/features/admin/chat/components/ChatWindow";
import { ImagePreviewModal } from "@/features/admin/chat/components/ImagePreviewModal";

// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
const SYSTEM_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  { id: "products", label: "Sản phẩm", icon: <Package className="w-5 h-5" /> },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  { id: "users", label: "Khách hàng", icon: <Users className="w-5 h-5" /> },
  { id: "settings", label: "Cài đặt", icon: <Settings className="w-5 h-5" /> },
];

export default function AdminDashboard() {
  // State: Tab chính (System vs Chat)
  const [activePrimary, setActivePrimary] = useState<"system" | "chat">(
    "system"
  );

  // State: Mục được chọn
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  // Chat Hook
  const {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    messages,
    text,
    setText,
    pendingFile,
    setPendingFile,
    previewImage,
    setPreviewImage,
    handleSend,
    handleFileChange,
  } = useAdminChat();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <TooltipProvider>
        {/* =========================================
           CỘT A: PRIMARY SIDEBAR (Icon Navigation)
           ========================================= */}
        <aside className="w-[70px] bg-slate-950 flex flex-col items-center py-6 gap-6 z-20 flex-none text-slate-50">
          {/* Logo */}
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center font-bold text-primary-foreground text-lg shadow-lg">
            S
          </div>

          <Separator className="bg-slate-800 w-10" />

          {/* Nút Quản Lý */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant={activePrimary === "system" ? "secondary" : "ghost"}
                size="icon"
                className={`h-12 w-12 rounded-xl transition-all ${
                  activePrimary === "system"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                onClick={() => setActivePrimary("system")}
              >
                <LayoutDashboard className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Quản lý hệ thống</TooltipContent>
          </Tooltip>

          {/* Nút Chat (kèm Badge) */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant={activePrimary === "chat" ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-12 w-12 rounded-xl transition-all ${
                    activePrimary === "chat"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setActivePrimary("chat")}
                >
                  <MessageSquare className="w-6 h-6" />
                </Button>
                {/* Badge thông báo đỏ chót */}
                {rooms.some((r) => r.hasUnread) && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full border-2 border-slate-950"
                  >
                    {rooms.filter((r) => r.hasUnread).length}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Tin nhắn khách hàng</TooltipContent>
          </Tooltip>

          <div className="mt-auto flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </aside>

        {/* =========================================
           CỘT B: SECONDARY SIDEBAR (Context List)
           ========================================= */}
        <aside className="w-80 bg-background border-r flex flex-col flex-none transition-all duration-300">
          {/* Header Cột B */}
          <div className="h-16 border-b flex items-center px-6">
            <h2 className="font-semibold text-lg tracking-tight">
              {activePrimary === "system" ? "Menu Quản Trị" : "Hộp Thoại"}
            </h2>
          </div>

          {/* Nội dung Cột B */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {/* --- VIEW: SYSTEM MENU --- */}
              {activePrimary === "system" &&
                SYSTEM_MENU.map((item) => (
                  <Button
                    key={item.id}
                    variant={selectedMenu === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 text-base ${
                      selectedMenu === item.id
                        ? "bg-slate-100 dark:bg-slate-800 font-medium"
                        : "text-slate-500"
                    }`}
                    onClick={() => setSelectedMenu(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}

              {/* --- VIEW: CHAT LIST --- */}
              {activePrimary === "chat" && (
                <ChatRoomList
                  rooms={rooms}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                />
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* =========================================
           CỘT C: MAIN AREA (Workspace)
           ========================================= */}
        <main className="flex-1 bg-slate-50/50 dark:bg-slate-950 flex flex-col min-w-0">
          {/* Header Cột C */}
          <header className="h-16 border-b bg-background flex items-center justify-between px-6 flex-none">
            <div className="flex items-center gap-2">
              {activePrimary === "chat" && selectedRoomId ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                  >
                    Online
                  </Badge>
                  <span className="font-semibold text-sm">
                    Đang chat với khách hàng #{selectedRoomId}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Tổng quan hệ thống
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-900 text-white">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Nội dung chính */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            {/* --- CASE: SYSTEM DASHBOARD --- */}
            {activePrimary === "system" && (
              <div className="grid gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Ví dụ dùng Card shadcn */}
                  <Card className="p-6 space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tổng doanh thu
                    </span>
                    <div className="text-2xl font-bold">45.231.000₫</div>
                  </Card>
                  <Card className="p-6 space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Đơn hàng mới
                    </span>
                    <div className="text-2xl font-bold">+12</div>
                  </Card>
                </div>
                {/* Bảng dữ liệu sẽ đặt ở đây */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-96 flex items-center justify-center text-muted-foreground">
                  Khu vực hiển thị bảng dữ liệu (Data Table)
                </div>
              </div>
            )}

            {/* --- CASE: CHAT UI --- */}
            {activePrimary === "chat" && (
              <ChatWindow
                selectedRoomId={selectedRoomId}
                messages={messages}
                text={text}
                setText={setText}
                pendingFile={pendingFile}
                setPendingFile={setPendingFile}
                handleSend={handleSend}
                handleFileChange={handleFileChange}
                setPreviewImage={setPreviewImage}
              />
            )}
          </div>
        </main>
      </TooltipProvider>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        src={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
