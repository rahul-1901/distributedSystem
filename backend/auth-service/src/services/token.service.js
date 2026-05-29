import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export class TokenService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },
      env.SECRET_KEY,
      {
        expiresIn: env.JWT_EXPIRE_TIME,
      }
    );
  }

  generateVerificationToken(userId) {
    return jwt.sign(
      {
        userId,
      },
      env.SECRET_KEY,
      {
        expiresIn: env.JWT_EXPIRE_TIME,
      }
    );
  }

  generateResetToken(userId) {
    return jwt.sign(
      {
        userId,
      },
      env.SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, env.SECRET_KEY);
  }
}

export default new TokenService();