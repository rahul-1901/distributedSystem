import { resultService } from "../services/resultService/result.service.instance.js";

export const getHackathonResults = async (req, res, next) => {
  try {
    const results = await resultService.getResults(req.params.id);

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};
