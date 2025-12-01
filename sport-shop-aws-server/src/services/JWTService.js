import jwt from "jsonwebtoken";

class JWTService {
  static generateTokens(payload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET || "access_secret_key",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || "refresh_secret_key",
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || "access_secret_key"
      );
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || "refresh_secret_key"
      );
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET || "access_secret_key",
      { expiresIn: "15m" }
    );
  }
}

export default JWTService;
