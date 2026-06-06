import { adminAuthService } from "../services/adminAuth/adminAuth.service.instance.js";

export const adminGoogleLogin =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await adminAuthService.googleLogin(
          req.query.code
        );

      return res.status(200).json(
        result
      );
    } catch (error) {
      next(error);
    }
  };