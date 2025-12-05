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

const TOKEN = process.env.RESULTS_TOKEN; // GitHub Personal Access Token

if (!TOKEN) {
  console.error("Missing required env var: RESULTS_TOKEN");
  process.exit(1);
}

function loadSiteConfig() {
  const configPath = path.join(process.cwd(), "src", "config.ts");
  if (!fs.existsSync(configPath)) throw new Error("Unable to find src/config.ts");
  const raw = fs.readFileSync(configPath, "utf8");
  const match = raw.match(/export\s+const\s+siteConfig\s*=\s*({[\s\S]*?});?\s*$/);
  if (!match) throw new Error("Unable to parse siteConfig from src/config.ts");
  try {
    const code = match[1];
    return new Function(`return (${code});`)();
  } catch (err) {
    throw new Error(`Failed to evaluate siteConfig: ${err.message}`);
  }
}

function extractTestProjects(siteConfig) {
  const collections = Object.values(siteConfig).filter(Array.isArray);
  const projects = [];
  for (const group of collections) {
    for (const item of group) {
      const tr = item?.testResults;
      const gh = tr?.github;
      if (tr && gh && tr.enabled !== false) {
        projects.push({
          name: item?.name || "Unnamed Project",
          github: {
            owner: gh.owner,
            repo: gh.repo,
            branch: gh.branch,
            path: gh.path,
            dataUrl: gh.dataUrl || tr.dataUrl,
            days: gh.days,
            linkStyle: gh.linkStyle,
          },
        });
      }
    }
  }
  return projects;
}

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

function normalizeDays(days) {
  const val = Number.parseInt(days ?? "7", 10);
  return Number.isFinite(val) && val > 0 ? val : 7;
}

function normalizeLinkStyle(linkStyle) {
  return linkStyle === "raw" ? "raw" : "blob";
}

function resolveOutputFile(dataUrl) {
  const rel = (dataUrl || "").replace(/^\/+/, "");
  if (!rel) throw new Error("Missing dataUrl for test results");
  return path.join(process.cwd(), "public", rel);
}

function requireFields(obj, fields) {
  const missing = fields.filter((f) => !obj[f]);
  if (missing.length) throw new Error(`Missing required GitHub config fields: ${missing.join(", ")}`);
}

function buildGithubCtx(github) {
  requireFields(github, ["owner", "repo", "branch", "path"]);
  return {
    owner: github.owner,
    repo: github.repo,
    branch: github.branch,
    resultsPath: github.path,
    daysLimit: normalizeDays(github.days),
    linkStyle: normalizeLinkStyle(github.linkStyle),
  };
}

async function fetchViaApiRaw(name, ctx) {
  const url = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/contents/${encPath(ctx.resultsPath)}/${encodeURIComponent(
    name,
  )}?ref=${encodeURIComponent(ctx.branch)}`;
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

async function fetchFileWithFallback(name, ctx) {
  try {
    return await fetchViaApiRaw(name, ctx);
  } catch {}

  const url = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/contents/${encPath(ctx.resultsPath)}/${encodeURIComponent(
    name,
  )}?ref=${encodeURIComponent(ctx.branch)}`;
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

async function loadFromGitHub(ctx) {
  const listUrl = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/contents/${encPath(
    ctx.resultsPath,
  )}?ref=${encodeURIComponent(ctx.branch)}`;
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
  const limitedKeys = Number.isFinite(ctx.daysLimit) && ctx.daysLimit > 0 ? allKeys.slice(-ctx.daysLimit) : allKeys;

  const runs = [];
  for (const key of limitedKeys) {
    const f = byDate.get(key);
    if (!f) continue;
    let text = null;
    let json = null;
    let downloadUrl = f.download_url;

    try {
      const res = await fetchFileWithFallback(f.name, ctx);
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
      ctx.linkStyle === "raw" && downloadUrl
        ? downloadUrl
        : `https://github.com/${ctx.owner}/${ctx.repo}/blob/${encodeURIComponent(ctx.branch)}/${ctx.resultsPath}/${encodeURIComponent(
            f.name,
          )}`;

    runs.push({ key, label: fmtDayLabel(key), link, ...counts });
  }

  return { allKeys, runs };
}

async function main() {
  const siteConfig = loadSiteConfig();
  const projects = extractTestProjects(siteConfig);
  if (!projects.length) {
    console.log("No projects with testResults enabled; skipping fetch.");
    return;
  }

  for (const project of projects) {
    const gh = project.github || {};
    const outputFile = resolveOutputFile(gh.dataUrl);
    const ctx = buildGithubCtx(gh);
    const { runs } = await loadFromGitHub(ctx);
    if (!runs.length) throw new Error(`No runs found to write for ${project.name}`);

    const payload = {
      project: project.name,
      generatedAt: new Date().toISOString(),
      source: {
        owner: ctx.owner,
        repo: ctx.repo,
        branch: ctx.branch,
        path: ctx.resultsPath,
        days: ctx.daysLimit,
        linkStyle: ctx.linkStyle,
      },
      runs,
    };

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
    console.log(`Wrote ${runs.length} runs for ${project.name} to ${path.relative(process.cwd(), outputFile)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
