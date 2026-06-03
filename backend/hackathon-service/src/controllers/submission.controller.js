import { submissionService } from "../services/submissionService/submission.service.instance.js";

export const createSubmission = async (req, res, next) => {
  try {
    const result = await submissionService.createSubmission({
      userId: req.user._id,
      hackathonId: req.params.hackathonId,
      title: req.body.title,
      description: req.body.description,
      submissionData: req.body.submissionData,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSubmission = async (req, res, next) => {
  try {
    const result = await submissionService.updateSubmission({
      userId: req.user._id,

      hackathonId: req.params.hackathonId,

      submissionId: req.params.submissionId,

      title: req.body.title,

      description: req.body.description,

      submissionData: req.body.submissionData,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMySubmission = async (req, res, next) => {
  try {
    const result = await submissionService.getMySubmissions(
      req.user._id,
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionById(
      req.params.submissionId,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    next(error);
  }
};
