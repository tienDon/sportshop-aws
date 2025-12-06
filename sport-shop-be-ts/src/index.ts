import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
// Đổi config từ dotenv thành import trực tiếp
import "dotenv/config";
// Import Prisma Client instance
import prisma from "./config/prisma";
import routes from "./routes";

// Khai báo ứng dụng Express
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error Handling Middleware (Cần có NextFunction)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Internal Error Stack:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ------------------------------------------------
// ⚠️ LOGIC KHỞI ĐỘNG CÓ THAY ĐỔI
// ------------------------------------------------

// Hàm chính khởi động server và kết nối DB
const startServer = async () => {
  try {
    // 1. KẾT NỐI DATABASE (Prisma.$connect)
    console.log("Connecting to MySQL RDS via Prisma...");
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // 2. KHỞI ĐỘNG SERVER EXPRESS
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Xử lý lỗi kết nối DB hoặc lỗi khởi động Server
    console.error("❌ Fatal Error: Failed to connect to DB or start server:", error);

    // Đảm bảo ngắt kết nối Prisma nếu có lỗi
    await prisma.$disconnect();

    // Thoát ứng dụng với mã lỗi 1
    process.exit(1);
  }
};

// Chạy hàm khởi động
startServer();
