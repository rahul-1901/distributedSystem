export const REDIS_KEYS = {
  ACTIVE_HACKATHONS: "hackathons:active",

  UPCOMING_HACKATHONS: "hackathons:upcoming",

  EXPIRED_HACKATHONS: "hackathons:expired",

  HACKATHON: (id) => `hackathon:${id}`,

  RESULTS: (id) => `hackathon:${id}:results`,
};

export const PUBLIC_HACKATHON_KEYS = [
  REDIS_KEYS.ACTIVE_HACKATHONS,
  REDIS_KEYS.UPCOMING_HACKATHONS,
  REDIS_KEYS.EXPIRED_HACKATHONS,
];
