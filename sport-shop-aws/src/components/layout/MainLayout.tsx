import React from "react";
import { Outlet } from "react-router";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />
      <main>
        <Outlet />
      </main>
      {/* Footer can be added here later */}
    </div>
  );
};

export default MainLayout;
