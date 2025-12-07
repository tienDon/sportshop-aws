import {
  createOrder,
  getOrderById,
  getOrders,
} from "@/controllers/OrderController.js";
import { authenticateToken } from "@/middlewares/auth.js";
import { Router } from "express";

const router = Router();

router.post("/", authenticateToken, createOrder);
// {
//   "cartId": 50,
//   "shippingAddressId": 12, // ID của UserAddress được chọn
//   "userPhoneId": 5,        // ID của UserPhone được chọn
//   "note": "Giao hàng sau 5h chiều"
// }
router.get("/", authenticateToken, getOrders);
// {
//     "success": true,
//     "data": {
//         "orders": [
//             {
//                 "orderId": 101,
//                 "orderCode": "#ORD-12345",
//                 "orderDate": "2025-12-07T10:30:00Z",
//                 "status": "SHIPPING",
//                 "totalFinalAmount": "1800000.00",
//                 "receiverName": "Nguyễn Văn A",
//                 "shippingAddress": "Số 123 Đường X, Phường Y, Quận Z, TP. Hồ Chí Minh",
//                 "items": [
//                     {
//                         "quantity": 1,
//                         "price": "1800000.00",
//                         "productName": "Áo Đá Bóng Nam Adidas...",
//                         "variantDetails": "Màu Đen / Size L",
//                         "mainImageUrl": "/images/product/main_01.jpg"
//                     }
//                 ]
//             },
//             ...
//         ],
//         "pagination": {
//             "total": 2,
//             "page": 1,
//             "limit": 10
//         }
//     }
// }
router.get("/:orderId", authenticateToken, getOrderById);

export default router;
