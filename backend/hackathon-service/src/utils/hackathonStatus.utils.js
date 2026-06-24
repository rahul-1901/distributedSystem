export const getLifecycleStatus = (hackathon) => {
  if (["DRAFT", "PENDING_APPROVAL", "REJECTED"].includes(hackathon.status)) {
    return hackathon.status;
  }

  const now = new Date();

  const starts = hackathon.phases.map((p) => new Date(p.startDate));

  const ends = hackathon.phases.map((p) => new Date(p.endDate));

  const earliestStart = new Date(Math.min(...starts));

  const latestEnd = new Date(Math.max(...ends));

  if (now < earliestStart) {
    return "UPCOMING";
  }

  if (now >= earliestStart && now <= latestEnd) {
    return "ACTIVE";
  }

  return "COMPLETED";
};
