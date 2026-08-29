// Always-visible standings for on-spot (match/bracket) events — derived
// purely from completed Match documents, no persisted per-team status.
// Unlike the submission feature's qualificationStatus, an on-spot team's
// status is fully determined the instant one match is marked COMPLETED,
// so there's no ambiguous window worth snapshotting.
export function buildStandings({ hackathon, teams, matches }) {
  const matchRoundPhases = (hackathon.phases || [])
    .filter((phase) => phase.phaseType === "MATCH_ROUND")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const roundIndexByPhaseId = new Map(
    matchRoundPhases.map((phase, index) => [phase._id.toString(), index])
  );
  const roundNameByIndex = matchRoundPhases.map((phase) => phase.phaseName);

  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  const statsByTeam = new Map();

  for (const match of completedMatches) {
    const roundIndex = roundIndexByPhaseId.get(
      match.phaseId ? match.phaseId.toString() : null
    );

    if (roundIndex === undefined) continue;

    for (const side of ["teamA", "teamB"]) {
      const teamRef = match[side];
      if (!teamRef) continue;

      const teamId = (teamRef._id || teamRef).toString();
      const ownScore = side === "teamA" ? match.scoreA : match.scoreB;
      const winnerId = match.winner
        ? (match.winner._id || match.winner).toString()
        : null;
      const isWinner = winnerId === teamId;

      const stats = statsByTeam.get(teamId) || {
        furthestRoundIndex: -1,
        eliminated: false,
        aggregateScore: 0,
        matchesPlayed: 0,
      };

      stats.aggregateScore += ownScore || 0;
      stats.matchesPlayed += 1;

      if (roundIndex >= stats.furthestRoundIndex) {
        stats.furthestRoundIndex = roundIndex;
        stats.eliminated = !isWinner;
      }

      statsByTeam.set(teamId, stats);
    }
  }

  const rows = teams.map((team) => {
    const stats = statsByTeam.get(team._id.toString()) || {
      furthestRoundIndex: -1,
      eliminated: false,
      aggregateScore: 0,
      matchesPlayed: 0,
    };

    return {
      team: { _id: team._id, name: team.name },
      furthestRoundIndex: stats.furthestRoundIndex,
      furthestRoundName:
        stats.furthestRoundIndex >= 0
          ? roundNameByIndex[stats.furthestRoundIndex]
          : "Not Started",
      eliminated: stats.eliminated,
      aggregateScore: stats.aggregateScore,
      matchesPlayed: stats.matchesPlayed,
    };
  });

  rows.sort((a, b) => {
    if (b.furthestRoundIndex !== a.furthestRoundIndex) {
      return b.furthestRoundIndex - a.furthestRoundIndex;
    }
    if (a.eliminated !== b.eliminated) {
      return a.eliminated ? 1 : -1;
    }
    if (b.aggregateScore !== a.aggregateScore) {
      return b.aggregateScore - a.aggregateScore;
    }
    return a.team.name.localeCompare(b.team.name);
  });

  return rows.map((row, index) => ({ rank: index + 1, ...row }));
}
