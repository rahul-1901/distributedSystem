import dotenv from "dotenv";
import { env } from "../config/env.js";
import authService from "../services/auth.service.js";
dotenv.config();

export const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query.token);

    if (result.success) {
      return res.redirect(`${env.FRONTEND_URL}/?verified=success`);
    }

    return res.redirect(`${env.FRONTEND_URL}/?verified=failed`);
  } catch (error) {
    next(error);
  }
};

export const sendResetLink = async (req, res, next) => {
  try {
    const result = await authService.sendResetLink(req.body.email);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.newPassword
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await oauthService.googleLogin(
        req.query.code
      );

    return res
      .status(result.statusCode)
      .json(result);
  } catch (error) {
    next(error);
  }
};