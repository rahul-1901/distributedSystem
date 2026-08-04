// Mirrors hackathon.model.js's `lifecycleStatus` virtual, but as a plain
// function. That virtual only computes over a real Mongoose document — this
// codebase has no `mongoose-lean-virtuals` plugin, so `.lean({ virtuals: true })`
// silently leaves `lifecycleStatus` as `undefined` on every lean-fetched
// hackathon. Use this instead whenever the hackathon came from a lean query.
export const getLifecycleStatus = (hackathon) => {
  if (hackathon.status !== "APPROVED") {
    return hackathon.status;
  }

  const now = new Date();

  if (!hackathon.phases || hackathon.phases.length === 0) {
    return "UPCOMING";
  }

  const activePhases = hackathon.phases.filter(
    (phase) => phase.isActive !== false
  );

  if (activePhases.length === 0) {
    return "UPCOMING";
  }

  const earliest = new Date(
    Math.min(...activePhases.map((phase) => new Date(phase.startDate).getTime()))
  );

  const latest = new Date(
    Math.max(...activePhases.map((phase) => new Date(phase.endDate).getTime()))
  );

  if (now < earliest) {
    return "UPCOMING";
  }

  if (now <= latest) {
    return "ACTIVE";
  }

  return "COMPLETED";
};
