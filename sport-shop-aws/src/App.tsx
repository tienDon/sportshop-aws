import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/home/HomePage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import BrandsPage from "./pages/brands/BrandsPage";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/useAuthStore";
import QueryProvider from "./providers/QueryProvider";

const App = () => {
  const { initializeAuth } = useAuthStore();

  // Initialize auth when app starts
  useEffect(() => {
    console.log("🚀 App starting, initializing auth...");
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryProvider>
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          style: {
            zIndex: 9999,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={<HomePage />} />

          {/* Auth routes */}
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> */}

          {/* Collections routes - All products */}
          <Route path="/collections" element={<ProductsPage />} />

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

          {/* Product detail */}
          <Route path="/products/:productId" element={<ProductDetailPage />} />

          {/* Search */}
          <Route path="/search" element={<ProductsPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
