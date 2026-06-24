import { discussionService } from "../services/discussionService/discussion.service.instance.js";

export const createMessage = async (req, res, next) => {
  try {
    const message = await discussionService.createMessage({
      userId: req.user._id,
      hackathonId: req.params.hackathonId,
      content: req.body.content,
      parentMessage: req.body.parentMessage,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await discussionService.getMessages({
      hackathonId: req.params.hackathonId,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const getReplies = async (req, res, next) => {
  try {
    const replies = await discussionService.getReplies(req.params.messageId);

    return res.status(200).json({
      success: true,
      replies,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    await discussionService.deleteMessage({
      messageId: req.params.messageId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
