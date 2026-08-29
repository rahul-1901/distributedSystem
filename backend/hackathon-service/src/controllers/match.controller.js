import { matchService } from "../services/matchService/match.service.instance.js";

export const createMatch = async (req, res, next) => {
  try {
    const match = await matchService.createMatch({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      phaseId: req.body.phaseId,
      teamA: req.body.teamA,
      teamB: req.body.teamB,
      order: req.body.order,
      scheduledAt: req.body.scheduledAt,
    });

    return res.status(201).json({ success: true, match });
  } catch (error) {
    next(error);
  }
};

export const updateMatchScore = async (req, res, next) => {
  try {
    const match = await matchService.updateMatchScore({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      matchId: req.params.matchId,
      scoreA: req.body.scoreA,
      scoreB: req.body.scoreB,
      winner: req.body.winner,
    });

    return res.status(200).json({ success: true, match });
  } catch (error) {
    next(error);
  }
};

export const updateMatchStatus = async (req, res, next) => {
  try {
    const match = await matchService.updateMatchStatus({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      matchId: req.params.matchId,
      status: req.body.status,
    });

    return res.status(200).json({ success: true, match });
  } catch (error) {
    next(error);
  }
};

export const updateMatchSchedule = async (req, res, next) => {
  try {
    const match = await matchService.updateSchedule({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      matchId: req.params.matchId,
      scheduledAt: req.body.scheduledAt,
    });

    return res.status(200).json({ success: true, match });
  } catch (error) {
    next(error);
  }
};

export const reorderMatches = async (req, res, next) => {
  try {
    await matchService.reorderMatches({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      phaseId: req.params.phaseId,
      orderedMatchIds: req.body.orderedMatchIds || [],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (req, res, next) => {
  try {
    await matchService.deleteMatch({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      matchId: req.params.matchId,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getRoundMatchesAdmin = async (req, res, next) => {
  try {
    const matches = await matchService.getRoundMatches({
      hackathonId: req.params.id,
      phaseId: req.params.phaseId,
    });

    return res.status(200).json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

export const getRoundMatchesPublic = async (req, res, next) => {
  try {
    const matches = await matchService.getRoundMatches({
      hackathonId: req.params.id,
      phaseId: req.params.phaseId,
    });

    return res.status(200).json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

export const getStandings = async (req, res, next) => {
  try {
    const standings = await matchService.getStandings({
      hackathonId: req.params.id,
    });

    return res.status(200).json({ success: true, standings });
  } catch (error) {
    next(error);
  }
};
