// import React, { useEffect } from "react";
// import { BrowserRouter, Routes, Route } from "react-router";
// import HomePage from "./pages/home/HomePage";
// import ProductsPage from "./pages/products/ProductsPage";
// import ProductDetailPage from "./pages/product-detail/ProductDetailPage";
// import BrandsPage from "./pages/brands/BrandsPage";
// import AdminPage from "./pages/admin/AdminPage";
// import CheckoutPage from "./pages/checkout/CheckoutPage";
// import OrdersPage from "./pages/account/OrdersPage";
// import ProfilePage from "./pages/account/ProfilePage";
// import { Toaster } from "sonner";
// import { useAuthStore } from "./store/useAuthStore";
// import QueryProvider from "./providers/QueryProvider";
// import MainLayout from "./components/layout/MainLayout";
// import ChatBubble from "./components/common/ChatBubble";

// import CustomerChat from "./legacy-chat/pages/CustomerChat";
// import AdminLegacyChat from "./legacy-chat/pages/AdminDashboard";

// const App = () => {
//   const { initializeAuth } = useAuthStore();

//   // Initialize auth when app starts
//   useEffect(() => {
//     console.log("🚀 App starting, initializing auth...");
//     initializeAuth();
//   }, [initializeAuth]);

//   return (
//     <QueryProvider>
//       <Toaster
//         richColors
//         position="top-center"
//         toastOptions={{
//           style: {
//             zIndex: 9999,
//           },
//         }}
//       />
//       <BrowserRouter>
//         <Routes>
//           {/* Public Routes wrapped in MainLayout */}
//           <Route element={<MainLayout />}>
//             {/* Trang chủ */}
//             <Route path="/" element={<HomePage />} />

//             {/* Collections routes - All products */}
//             <Route path="/collections" element={<ProductsPage />} />
//             <Route path="/products/:slug" element={<ProductDetailPage />} />

//             {/* Collections routes - 3 cấp độ */}
//             <Route path="/collections/:category" element={<ProductsPage />} />
//             <Route
//               path="/collections/:category/:subcategory"
//               element={<ProductsPage />}
//             />
//             <Route
//               path="/collections/:category/:subcategory/:subsubcategory"
//               element={<ProductsPage />}
//             />

//             {/* Brands routes */}
//             <Route path="/brands" element={<BrandsPage />} />
//             <Route path="/brands/:brand" element={<ProductsPage />} />

//             {/* Sports routes */}
//             <Route path="/sports" element={<ProductsPage />} />
//             <Route path="/sports/:sport" element={<ProductsPage />} />

//             {/* Search */}
//             <Route path="/search" element={<ProductsPage />} />

//             {/* Checkout & Account */}
//             <Route path="/checkout" element={<CheckoutPage />} />
//             <Route path="/account/orders" element={<OrdersPage />} />
//             <Route path="/account/profile" element={<ProfilePage />} />
//           </Route>

//           {/* Admin Routes - No Header/Footer */}
//           <Route path="/admin" element={<AdminPage />} />
//           <Route path="/admin/legacy-chat" element={<AdminLegacyChat />} />

//           {/* Catch-all route */}
//           <Route path="*" element={<div>Page not found</div>} />
//         </Routes>
//         <CustomerChat />
//       </BrowserRouter>
//     </QueryProvider>
//   );
// };

// export default App;
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import HomePage from "./pages/home/HomePage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetailPage from "./pages/product-detail/ProductDetailPage";
import BrandsPage from "./pages/brands/BrandsPage";
import AdminPage from "./pages/admin/AdminPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrdersPage from "./pages/account/OrdersPage";
import ProfilePage from "./pages/account/ProfilePage";
import { Toaster } from "sonner";

import { useAuthStore } from "./store/useAuthStore";
import QueryProvider from "./providers/QueryProvider";
import MainLayout from "./components/layout/MainLayout";

import CustomerChat from "./legacy-chat/pages/CustomerChat";
import AdminLegacyChat from "./legacy-chat/pages/AdminDashboard";

// 👇 Component bên trong dùng được useLocation
const AppInner = () => {
  const { initializeAuth } = useAuthStore();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  
  // Debug: Log routing info
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      console.log("🔍 AppInner - Admin route detected:", {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        isAdminRoute,
      });
    }
  }, [location.pathname, location.search, location.hash, isAdminRoute]);

  // Initialize auth when app starts
  useEffect(() => {
    console.log("🚀 App starting, initializing auth...");
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          style: {
            zIndex: 9999,
          },
        }}
      />

      <Routes>
        {/* Public Routes wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          {/* Trang chủ */}
          <Route path="/" element={<HomePage />} />

          {/* Collections routes - All products */}
          <Route path="/collections" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />

          {/* Collections routes - 3 cấp độ */}
          <Route path="/collections/:category" element={<ProductsPage />} />
          <Route
            path="/collections/:category/:subcategory"
            element={<ProductsPage />}
          />
          <Route
            path="/collections/:category/:subcategory/:subsubcategory"
            element={<ProductsPage />}
          />

          {/* Brands routes */}
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/brands/:brand" element={<ProductsPage />} />

          {/* Sports routes */}
          <Route path="/sports" element={<ProductsPage />} />
          <Route path="/sports/:sport" element={<ProductsPage />} />

          {/* Search */}
          <Route path="/search" element={<ProductsPage />} />

          {/* Checkout & Account */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes - No Header/Footer */}
        {/* Route cụ thể phải đặt trước route wildcard */}
        <Route path="/admin/legacy-chat" element={<AdminLegacyChat />} />
        {/* Route /admin/* để handle tất cả các route con của /admin (bao gồm /admin/products/:slug) */}
        <Route path="/admin/*" element={<AdminPage />} />

        {/* Catch-all route */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>

      {/* Bong bóng chat CHỈ hiện ở phía customer, không hiện trong /admin */}
      {!isAdminRoute && <CustomerChat />}
    </>
  );
};

const App = () => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
