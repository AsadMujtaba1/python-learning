import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// In-memory cache with TTL
const CACHE: Record<string, { data: any; expires: number }> = {};
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper: load bundled EV models
function loadEvModels() {
  const filePath = path.join(process.cwd(), "lib", "tools", "evCharging", "data", "evModels.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// Helper: Wikidata SPARQL query (server-side fetch)
async function fetchWikidataSpec(make: string, model: string) {
  // Best-effort: search for battery capacity (kWh) for the given make/model
  const query = `SELECT ?battery ?efficiency WHERE {
    ?car wdt:P31 wd:Q1420; wdt:P176 ?make; wdt:P571 ?date; wdt:P2040 ?battery.
    OPTIONAL { ?car wdt:P4872 ?efficiency. }
    ?make rdfs:label "${make}"@en.
    ?car rdfs:label ?label.
    FILTER(CONTAINS(LCASE(?label), "${model.toLowerCase()}"))
    FILTER(LANG(?label) = "en")
  } LIMIT 1`;
  const url =
    "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);
  const res = await fetch(url, { headers: { "User-Agent": "CostSaverEVTool/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results.bindings.length) return null;
  const binding = data.results.bindings[0];
  return {
    batteryKwh: binding.battery?.value ? parseFloat(binding.battery.value) : undefined,
    efficiencyMpkwh: binding.efficiency?.value ? parseFloat(binding.efficiency.value) : undefined,
    source: "wikidata"
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get("make")?.trim() || "";
  const model = searchParams.get("model")?.trim() || "";
  if (!make || !model) {
    return NextResponse.json({ found: false, error: "Missing make or model" }, { status: 400 });
  }
  const cacheKey = `${make.toLowerCase()}|${model.toLowerCase()}`;
  const now = Date.now();
  if (CACHE[cacheKey] && CACHE[cacheKey].expires > now) {
    return NextResponse.json({ ...CACHE[cacheKey].data, found: true, source: CACHE[cacheKey].data.source || "cache" });
  }
  // 1. Try bundled list (exact or loose match)
  const evModels = loadEvModels();
  let found = evModels.find((ev: any) =>
    ev.make.toLowerCase() === make.toLowerCase() && ev.model.toLowerCase() === model.toLowerCase()
  );
  if (!found) {
    found = evModels.find((ev: any) =>
      ev.make.toLowerCase() === make.toLowerCase() && model.toLowerCase().includes(ev.model.toLowerCase())
    );
  }
  if (found) {
    CACHE[cacheKey] = { data: { ...found, source: "bundled" }, expires: now + CACHE_TTL_MS };
    return NextResponse.json({ ...found, found: true, source: "bundled" });
  }
  // 2. Try Wikidata
  const wikidata = await fetchWikidataSpec(make, model);
  if (wikidata && wikidata.batteryKwh) {
    CACHE[cacheKey] = { data: wikidata, expires: now + CACHE_TTL_MS };
    return NextResponse.json({ ...wikidata, found: true });
  }
  // 3. Not found
  return NextResponse.json({ found: false });
}
