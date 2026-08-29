import { calculateFinalScore } from "./scoreCalculator.js";

const getEntityKey = (submission) => {
  if (submission.team) {
    return `team:${(submission.team._id || submission.team).toString()}`;
  }

  if (submission.participant) {
    return `participant:${(
      submission.participant._id || submission.participant
    ).toString()}`;
  }

  return null;
};

const effectiveRange = (phase, hackathon) => {
  const minScore =
    phase?.judgingConfig?.minScore ?? hackathon.judgingConfig?.minScore ?? 0;
  const maxScore =
    phase?.judgingConfig?.maxScore ?? hackathon.judgingConfig?.maxScore ?? 100;

  return { minScore, maxScore };
};

const normalizeScore = (score, minScore, maxScore) => {
  if (maxScore <= minScore) return 0;

  const clamped = Math.min(Math.max(score, minScore), maxScore);

  return ((clamped - minScore) / (maxScore - minScore)) * 100;
};

// Cumulative, per-round-weighted leaderboard across every SUBMISSION phase
// of a hackathon — replaces the old "only the last phase counts" logic.
// Scores get normalized to a common 0-100 scale before weighting, since
// different rounds can have different judging ranges.
export function buildWeightedLeaderboard({ hackathon, submissions }) {
  const submissionPhases = (hackathon.phases || []).filter(
    (phase) => phase.phaseType === "SUBMISSION"
  );
  const phaseById = new Map(
    submissionPhases.map((phase) => [phase._id.toString(), phase])
  );

  // If no phase has an admin-configured weight, treat every round as
  // equally weighted instead of the whole cumulative sum collapsing to 0.
  const allZeroWeight = submissionPhases.every((phase) => !phase.weight);

  const entities = new Map();

  for (const submission of submissions) {
    const phase = submission.phaseId
      ? phaseById.get(submission.phaseId.toString())
      : null;

    if (!phase) continue;

    const entityKey = getEntityKey(submission);

    if (!entityKey) continue;

    if (!entities.has(entityKey)) {
      entities.set(entityKey, {
        participant: submission.participant || null,
        team: submission.team || null,
        phaseScores: [],
        weightedSum: 0,
        weightSum: 0,
        lastVoteCount: 0,
        lastSubmittedAt: null,
        lastSubmissionId: submission._id,
      });
    }

    const entity = entities.get(entityKey);

    const { minScore, maxScore } = effectiveRange(phase, hackathon);
    const normalizedScore = normalizeScore(
      submission.averageScore || 0,
      minScore,
      maxScore
    );
    const weight = allZeroWeight ? 1 : phase.weight || 0;

    entity.phaseScores.push({
      phaseId: phase._id,
      phaseName: phase.phaseName,
      averageScore: submission.averageScore,
      weight,
      qualificationStatus: submission.qualificationStatus,
    });

    entity.weightedSum += weight * normalizedScore;
    entity.weightSum += weight;

    if (
      !entity.lastSubmittedAt ||
      new Date(submission.submittedAt) >= new Date(entity.lastSubmittedAt)
    ) {
      entity.lastVoteCount = submission.voteCount || 0;
      entity.lastSubmittedAt = submission.submittedAt;
      entity.lastSubmissionId = submission._id;
      entity.participant = submission.participant || entity.participant;
      entity.team = submission.team || entity.team;
    }
  }

  const rows = Array.from(entities.values()).map((entity) => ({
    ...entity,
    averageScore:
      entity.weightSum > 0 ? entity.weightedSum / entity.weightSum : 0,
  }));

  const maxVoteCount = rows.length
    ? Math.max(...rows.map((row) => row.lastVoteCount || 0))
    : 0;
  const voteWeight = hackathon.votingConfig?.voteWeight || 0;

  const leaderboard = rows.map((row) => ({
    _id: row.lastSubmissionId,
    participant: row.participant,
    team: row.team,
    averageScore: row.averageScore,
    voteCount: row.lastVoteCount,
    phaseScores: row.phaseScores,
    submittedAt: row.lastSubmittedAt,
    finalScore: calculateFinalScore({
      averageScore: row.averageScore,
      voteCount: row.lastVoteCount,
      maxVoteCount,
      voteWeight,
      maxJudgeScore: 100,
    }),
  }));

  leaderboard.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return new Date(a.submittedAt) - new Date(b.submittedAt);
  });

  return leaderboard;
}
