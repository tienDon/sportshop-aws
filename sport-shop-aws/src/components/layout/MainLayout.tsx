import React from "react";
import { Outlet } from "react-router";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import ChatBubble from "@/components/common/ChatBubble";
import CustomerChat from "@/legacy-chat/pages/CustomerChat";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />
      <main>
        <Outlet />
      </main>
      {/* <ChatBubble /> */}
      <CustomerChat />
      {/* Footer can be added here later */}
      <Footer/>
    </div>
  );
};

export default MainLayout;
