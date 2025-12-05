import fs from "fs";
import path from "path";

// Lightweight .env loader (avoids extra dependency)
const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

// Support both RESULTS_* (preferred) and legacy GITHUB_* env names
const env = process.env;
const OWNER = env.RESULTS_OWNER;
const REPO = env.RESULTS_REPO;
const BRANCH = env.RESULTS_BRANCH;
const RESULTS_PATH = env.RESULTS_PATH;
const RESULTS_DAYS = env.RESULTS_DAYS || "7";
const RESULTS_LINK_STYLE = env.RESULTS_LINK_STYLE || "blob";
const TOKEN = env.RESULTS_TOKEN; // GitHub Personal Access Token

const missing = [
  ["RESULTS_OWNER", OWNER],
  ["RESULTS_REPO", REPO],
  ["RESULTS_BRANCH", BRANCH],
  ["RESULTS_PATH", RESULTS_PATH],
  ["RESULTS_TOKEN", TOKEN],
].filter(([, val]) => !val);

if (missing.length) {
  const names = missing.map(([name]) => name).join(", ");
  console.error(`Missing required env vars: ${names}`);
  process.exit(1);
}

const daysLimit = Number.parseInt(RESULTS_DAYS, 10);
const linkStyle = RESULTS_LINK_STYLE === "raw" ? "raw" : "blob";
const outputFile = path.join(process.cwd(), "public", "data", "test-results.json");

function headers(extra = {}) {
  return {
    "User-Agent": "fetch-test-results-script",
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${TOKEN}`,
    ...extra,
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function encPath(p) {
  return (p || "").split("/").map(encodeURIComponent).join("/");
}

function toDateKeyFromName(name) {
  const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function decodeBufferSmart(buf) {
  try {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    if (u8.length >= 2) {
      const bom = (u8[0] << 8) | u8[1];
      if (bom === 0xfeff) return new TextDecoder("utf-16be").decode(u8);
      if (bom === 0xfffe) return new TextDecoder("utf-16le").decode(u8);
    }
    const utf8 = new TextDecoder("utf-8").decode(u8);
    if (/\u0000/.test(utf8)) {
      try {
        return new TextDecoder("utf-16le").decode(u8);
      } catch {}
      try {
        return new TextDecoder("utf-16be").decode(u8);
      } catch {}
    }
    return utf8;
  } catch {
    return "";
  }
}

function decodeBase64ToTextSmart(b64) {
  try {
    const bin = Buffer.from(b64, "base64");
    return decodeBufferSmart(bin);
  } catch {
    return "";
  }
}

function summarizePlaywright(json) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  function countFromTestLike(test) {
    if (Array.isArray(test.results) && test.results.length) {
      for (const res of test.results) {
        const s = res.status || test.status;
        if (s === "passed") passed++;
        else if (s === "failed") failed++;
        else if (s === "skipped") skipped++;
      }
      return true;
    }
    if (typeof test.status === "string") {
      const s = test.status;
      if (s === "passed") passed++;
      else if (s === "failed") failed++;
      else if (s === "skipped") skipped++;
      return true;
    }
    return false;
  }
  function walkSuite(suite) {
    if (!suite || typeof suite !== "object") return;
    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) {
        if (Array.isArray(spec.tests)) {
          for (const t of spec.tests) countFromTestLike(t);
        }
      }
    }
    if (Array.isArray(suite.suites)) {
      for (const s of suite.suites) walkSuite(s);
    }
    if (Array.isArray(suite.tests)) {
      for (const t of suite.tests) countFromTestLike(t);
    }
  }
  if (Array.isArray(json?.suites)) {
    for (const s of json.suites) walkSuite(s);
  }
  return { passed, failed, skipped };
}

function heuristicCount(text) {
  const count = (re) => (text.match(re) || []).length;
  const passed =
    count(/\bstatus\"\s*:\s*\"passed\"/g) +
    count(/\boutcome\"\s*:\s*\"expected\"/g) +
    count(/\bok\"\s*:\s*true\b/g);
  const failed =
    count(/\bstatus\"\s*:\s*\"failed\"/g) +
    count(/\boutcome\"\s*:\s*\"unexpected\"/g) +
    count(/\bok\"\s*:\s*false\b/g) +
    count(/\btimedout\"\s*:\s*true\b/g);
  const skipped =
    count(/\bstatus\"\s*:\s*\"skipped\"/g) +
    count(/\bskipped\"\s*:\s*true\b/g) +
    count(/\bpending\"\s*:\s*true\b/g);
  return { passed, failed, skipped };
}

function fmtDayLabel(key) {
  const d = new Date(key);
  const opts = { month: "short", day: "numeric" };
  return d.toLocaleDateString(undefined, opts);
}

async function fetchViaApiRaw(name) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encPath(RESULTS_PATH)}/${encodeURIComponent(
    name,
  )}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, {
    headers: headers({ Accept: "application/vnd.github.v3.raw" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = await res.arrayBuffer();
  const text = decodeBufferSmart(buf);
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    try {
      json = JSON.parse((text || "").replace(/\u0000/g, ""));
    } catch {}
  }
  return { text, json };
}

async function fetchFileWithFallback(name) {
  try {
    return await fetchViaApiRaw(name);
  } catch {}

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encPath(RESULTS_PATH)}/${encodeURIComponent(
    name,
  )}?ref=${encodeURIComponent(BRANCH)}`;
  try {
    const details = await fetchJson(url);
    if (details && typeof details.content === "string" && details.encoding === "base64") {
      const text = decodeBase64ToTextSmart(details.content || "");
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        try {
          json = JSON.parse((text || "").replace(/\u0000/g, ""));
        } catch {}
      }
      return { text, json, download_url: details.download_url };
    }
    if (details && details.download_url) {
      const r = await fetch(details.download_url, { headers: { "User-Agent": "fetch-test-results-script" } });
      if (r.ok) {
        const buf = await r.arrayBuffer();
        const text = decodeBufferSmart(buf);
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          try {
            json = JSON.parse((text || "").replace(/\u0000/g, ""));
          } catch {}
        }
        return { text, json, download_url: details.download_url };
      }
    }
  } catch {}

  throw new Error(`Unable to fetch ${name}`);
}

async function loadFromGitHub() {
  const listUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encPath(
    RESULTS_PATH,
  )}?ref=${encodeURIComponent(BRANCH)}`;
  const items = await fetchJson(listUrl);
  if (!Array.isArray(items)) throw new Error("Unexpected listing response");

  const files = items
    .filter((x) => x.type === "file" && /\.json$/i.test(x.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const byDate = new Map();
  for (const f of files) {
    const key = toDateKeyFromName(f.name);
    if (!key) continue;
    const existing = byDate.get(key);
    if (!existing || f.name > existing.name) byDate.set(key, f);
  }

  const allKeys = Array.from(byDate.keys()).sort((a, b) => a.localeCompare(b));
  const limitedKeys = Number.isFinite(daysLimit) && daysLimit > 0 ? allKeys.slice(-daysLimit) : allKeys;

  const runs = [];
  for (const key of limitedKeys) {
    const f = byDate.get(key);
    if (!f) continue;
    let text = null;
    let json = null;
    let downloadUrl = f.download_url;

    try {
      const res = await fetchFileWithFallback(f.name);
      text = res.text;
      json = res.json;
      downloadUrl = res.download_url || downloadUrl;
    } catch (err) {
      console.warn(`Skipping ${f.name}: ${err.message}`);
      continue;
    }

    let counts = json ? summarizePlaywright(json) : { passed: 0, failed: 0, skipped: 0 };
    if (counts.passed + counts.failed + counts.skipped === 0 && text) {
      counts = heuristicCount(text.replace(/\u0000/g, ""));
    }

    const link =
      linkStyle === "raw" && downloadUrl
        ? downloadUrl
        : `https://github.com/${OWNER}/${REPO}/blob/${encodeURIComponent(BRANCH)}/${RESULTS_PATH}/${encodeURIComponent(
            f.name,
          )}`;

    runs.push({ key, label: fmtDayLabel(key), link, ...counts });
  }

  return { allKeys, runs };
}

async function main() {
  const { runs } = await loadFromGitHub();
  if (!runs.length) throw new Error("No runs found to write");

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      owner: OWNER,
      repo: REPO,
      branch: BRANCH,
      path: RESULTS_PATH,
      days: daysLimit,
      linkStyle,
    },
    runs,
  };

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${runs.length} runs to ${path.relative(process.cwd(), outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
