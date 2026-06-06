export const calculateFinalScore = ({
    averageScore,
    voteCount,
    maxVoteCount,
    voteWeight,
    maxJudgeScore,
  }) => {
    const judgeWeight =
      100 - voteWeight;
  
    const voteScore =
      maxVoteCount === 0
        ? 0
        : (voteCount / maxVoteCount) *
          maxJudgeScore;
  
    return (
      (averageScore *
        judgeWeight) /
        100 +
      (voteScore *
        voteWeight) /
        100
    );
  };