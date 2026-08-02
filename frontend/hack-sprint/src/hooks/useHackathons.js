import { useQuery } from "@tanstack/react-query";
import { HackathonAPI } from "../api/hackathon.api.js";

// Backend paginates (default limit 12, max not confirmed). We pull a high
// limit per bucket to approximate the old "fetch everything" behaviour.
// Revisit with real pagination if any bucket regularly exceeds this.
const FETCH_LIMIT = 100;

// phases[] replaced the old flat startDate/endDate/submissionEndDate fields.
// Derive an overall window from all phases (earliest start -> latest end),
// matching the same logic the backend's lifecycleStatus virtual uses.
const derivePhaseWindow = (phases) => {
  if (!phases || phases.length === 0) return { start: null, end: null };
  const starts = phases.map((p) => new Date(p.startDate).getTime());
  const ends = phases.map((p) => new Date(p.endDate).getTime());
  return {
    start: new Date(Math.min(...starts)),
    end: new Date(Math.max(...ends)),
  };
};

// Submission countdown should target the SUBMISSION phase's endDate, not
// the overall window end. Falls back to the overall end if there's no
// SUBMISSION phase.
const deriveSubmissionEnd = (phases, fallbackEnd) => {
  const submissionPhases = (phases || []).filter(
    (p) => p.phaseType === "SUBMISSION"
  );
  if (submissionPhases.length === 0) return fallbackEnd;
  return new Date(
    Math.max(...submissionPhases.map((p) => new Date(p.endDate).getTime()))
  );
};

const formatDate = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

// Only adds derived convenience fields on top of the backend object.
// Every native backend field name (lifecycleStatus, numParticipants,
// techStacks, image.url, phases, etc.) is left untouched — no aliasing.
const mapHackathon = (h) => {
  const { start, end } = derivePhaseWindow(h.phases);
  const submissionEnd = deriveSubmissionEnd(h.phases, end);
  const totalPrize = (h.prizes || []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  return {
    ...h,
    overallStart: start,
    overallEnd: end,
    submissionEnd,
    totalPrize,
    formattedDate:
      start && end ? `${formatDate(start)} – ${formatDate(end)}` : "TBA",
  };
};

export const useHackathons = () => {
  return useQuery({
    queryKey: ["hackathons"],
    queryFn: async () => {
      // Backend filters by lifecycleStatus server-side via ?status=.
      // We do NOT recompute lifecycle client-side.
      const [activeRes, upcomingRes, completedRes] = await Promise.all([
        HackathonAPI.getHackathons({ status: "ACTIVE", limit: FETCH_LIMIT }),
        HackathonAPI.getHackathons({
          status: "UPCOMING",
          limit: FETCH_LIMIT,
        }),
        HackathonAPI.getHackathons({
          status: "COMPLETED",
          limit: FETCH_LIMIT,
        }),
      ]);

      return {
        active: (activeRes.data.data || []).map(mapHackathon),
        upcoming: (upcomingRes.data.data || []).map(mapHackathon),
        completed: (completedRes.data.data || []).map(mapHackathon),
      };
    },
    staleTime: 30 * 1000, // 30 seconds — Redis already absorbs repeat load
    refetchOnWindowFocus: true,
  });
};