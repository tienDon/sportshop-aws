import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./src/libs/db.js";
import authRoutes from "./src/routes/auth.js";
import categoryRoutes from "./src/routes/categories.js";
import brandRoutes from "./src/routes/brands.js";
import productRoutes from "./src/routes/products.js";
import navigationRoutes from "./src/routes/navigation.js";
import cartRoutes from "./src/routes/cart.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Sport Shop AWS Server is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/cart", cartRoutes);

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
