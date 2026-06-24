export const REDIS_KEYS = {
  PUBLIC_HACKATHONS: "hackathons:public",
  HACKATHON: (id) => `hackathon:${id}`,
  HACKATHON_SLUG: (slug) =>
    `hackathon:slug:${slug}`,
  RESULTS: (id) =>
    `hackathon:${id}:results`
};

export const PUBLIC_HACKATHON_KEYS = [
  REDIS_KEYS.PUBLIC_HACKATHONS,
];