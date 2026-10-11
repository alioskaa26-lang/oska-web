// Read-only QA CLI for bounded research candidates. No Queue/Raw writes and no HTTP.
import { readFile } from "node:fs/promises";
import { assessPublicLead } from "../lib/lead-quality.mjs";
const path = process.argv[2];
if (!path) {
  console.error("Usage: npm run pilot:leadqa -- ./local-research.json");
  process.exitCode = 2;
} else {
  try {
    const data = JSON.parse(await readFile(path,"utf8"));
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    const known = Array.isArray(data.known) ? data.known : [];
    if (candidates.length > 25) throw new Error("PILOT_LIMIT_25");
    const counts = {};
    for (const row of candidates) {
      const outcome = assessPublicLead(row,known);
      counts[outcome.status] = (counts[outcome.status] || 0) + 1;
      if (outcome.status === "VERIFIER_PENDING") known.push(row);
    }
    console.log(JSON.stringify({
      status:"READ_ONLY_PRE_VERIFIER_SCREEN_NOT_QUEUE_SUCCESS",
      reviewed:candidates.length,
      categories:counts,
      independentlyVerifiedNetNew:0,
    }));
  } catch (error) {
    console.error("PILOT_LOCAL_INPUT_INVALID");
    process.exitCode=2;
  }
}
