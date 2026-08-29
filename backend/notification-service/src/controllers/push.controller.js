import { pushService } from "../services/push.service.instance.js";

export const getVapidPublicKey = (req, res) => {
  return res.status(200).json({
    success: true,
    publicKey: pushService.getPublicKey(),
  });
};

export const subscribe = async (req, res, next) => {
  try {
    await pushService.subscribe(
      req.user._id,
      req.body.subscription,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    await pushService.unsubscribe(req.body.endpoint);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
