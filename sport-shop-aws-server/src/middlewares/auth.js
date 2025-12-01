import JWTService from "../services/JWTService.js";
import User from "../models/User.js";

/**
 * Middleware xác thực JWT token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token không tồn tại",
      });
    }

    // Verify access token
    const decoded = JWTService.verifyAccessToken(token);

    // Kiểm tra user còn tồn tại và active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Gắn thông tin user vào request
    req.user = {
      userId: user._id,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ",
      error: error.message,
    });
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }
  next();
};

/**
 * Middleware optional authentication - không bắt buộc phải có token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || "access_secret_key"
      );
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          name: user.name,
          role: user.role,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};
