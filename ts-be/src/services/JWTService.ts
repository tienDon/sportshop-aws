import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: number;
  role?: string;
}

class JWTService {
  static generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'access_secret_key', {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key', {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'access_secret_key'
      ) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret_key'
      ) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static generateAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'access_secret_key', {
      expiresIn: '15m',
    });
  }
}

export default JWTService;