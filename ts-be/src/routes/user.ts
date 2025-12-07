import { Router } from "express";
import { authenticateToken } from "@/middlewares/auth.js";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/controllers/UserAddressController.js";
import {
  createPhone,
  deletePhone,
  getPhones,
  updatePhone,
} from "@/controllers/UserPhoneController.js";

const router = Router();

// Address Routes
router.get("/addresses", authenticateToken, getAddresses);
router.post("/addresses", authenticateToken, createAddress);
router.put("/addresses/:id", authenticateToken, updateAddress);
router.delete("/addresses/:id", authenticateToken, deleteAddress);

// Phone Routes
router.get("/phones", authenticateToken, getPhones);
router.post("/phones", authenticateToken, createPhone);
router.put("/phones/:id", authenticateToken, updatePhone);
router.delete("/phones/:id", authenticateToken, deletePhone);

export default router;
