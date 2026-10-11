// Explicit opt-in, one publicly accessible URL, no recursion, no forms, no logins.
// Example: OSKA_PUBLIC_CRAWL_ENABLED=true OSKA_PUBLIC_ROUTE_ALLOWLIST=example.com
//          node scripts/public-route-canary.mjs https://example.com/ --mode=html
import { CheerioCrawler, PlaywrightCrawler } from "crawlee";
import { actualApex } from "../lib/lead-quality.mjs";

const enabled = process.env.OSKA_PUBLIC_CRAWL_ENABLED === "true";
const urlText = process.argv[2];
const browserMode = process.argv.includes("--mode=browser");
const allowed = new Set((process.env.OSKA_PUBLIC_ROUTE_ALLOWLIST || "")
  .split(",").map(v=>v.toLowerCase().trim().replace(/^www\./, "")).filter(Boolean));
const apex = actualApex(urlText);
if (!enabled || !apex || !allowed.has(apex)) {
  console.error("PILOT_DISABLED_OR_EXTERNAL_APEX_NOT_ALLOWLISTED");
  process.exitCode = 2;
} else {
  const answer = [];
  const common = {
    maxRequestsPerCrawl:1, maxConcurrency:1, maxRequestRetries:0,
    maxRequestsPerMinute:2, requestHandlerTimeoutSecs:30,
    respectRobotsTxtFile:true,
    retryOnBlocked:false,
    useSessionPool:false,
  };
  const validateLanding = request => {
    if (actualApex(request.loadedUrl || request.url) !== apex)
      throw new Error("UNEXPECTED_EXTERNAL_REDIRECT");
  };
  const crawler = browserMode
    ? new PlaywrightCrawler({
        ...common,
        launchContext:{launchOptions:{headless:true}},
        async requestHandler({request,page}) {
          validateLanding(request);
          const title=(await page.title()).slice(0,180);
          answer.push({apex,mode:"browser",title,observedAt:new Date().toISOString()});
        },
      })
    : new CheerioCrawler({
        ...common,
        async requestHandler({request,$}) {
          validateLanding(request);
          answer.push({apex,mode:"html",title:$("title").first().text().trim().slice(0,180),observedAt:new Date().toISOString()});
        },
      });
  await crawler.run([urlText]);
  console.log(JSON.stringify({status:answer.length ? "PILOT_RESEARCH_ONLY" : "NO_PUBLIC_RESULT_OR_ROBOTS_REJECT",results:answer}));
}
