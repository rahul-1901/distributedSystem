// Runs `worker` over every item in `items`, but never more than `limit` in
// flight at once. Plain `Promise.all(items.map(worker))` fires every call
// simultaneously — fine for a handful of recipients, but a phase-ending
// reminder can fan out to thousands of participants at once, which turns
// into thousands of concurrent HTTP calls to the Notification Service in a
// single burst. This bounds that burst without adding a queueing dependency
// for what's fundamentally a bounded, one-off background sweep.
export const mapWithConcurrency = async (items, worker, limit = 50) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runNext = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));

  return results;
};
