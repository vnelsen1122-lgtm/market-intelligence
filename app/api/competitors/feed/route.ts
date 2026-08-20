import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const publications = [
  { name: "EHS Today", url: "https://www.ehstoday.com/", tier: "Industry publication" },
  { name: "Safety+Health", url: "https://www.safetyandhealthmagazine.com/", tier: "NSC publication" },
  { name: "OSHA Media Center", url: "https://www.osha.gov/media-center", tier: "Federal primary source" },
  { name: "EHS Daily Advisor", url: "https://ehsdailyadvisor.blr.com/", tier: "Industry publication" },
  { name: "MSHA News & Media", url: "https://www.msha.gov/news-media", tier: "Federal primary source" },
];

const themes: Array<[string, string[]]> = [
  ["Regulation", ["rule", "regulation", "standard", "compliance", "osha", "msha"]],
  ["Enforcement", ["citation", "penalty", "fine", "inspection", "enforcement", "violation"]],
  ["Injuries & hazards", ["injury", "fatal", "hazard", "incident", "heat", "silica"]],
  ["Technology", ["software", "technology", "digital", "artificial intelligence", " ai "]],
  ["Market activity", ["acquisition", "merger", "investment", "hiring", "growth"]],
];

function clean(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&quot;/gi, '"').replace(/\s+/g, " ").trim();
}

function articles(baseUrl: string, html: string) {
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  return [...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((item) => {
    const title = clean(item[2]);
    if (title.length < 28 || title.length > 190 || /subscribe|sign up|learn more|view all|contact|advertise|privacy|newsletter/i.test(title)) return null;
    try {
      const url = new URL(item[1], base).toString();
      if (new URL(url).hostname !== base.hostname || seen.has(url)) return null;
      seen.add(url);
      const normalized = ` ${title.toLowerCase()} `;
      return { title, url, themes: themes.filter(([, terms]) => terms.some((term) => normalized.includes(term))).map(([label]) => label) };
    } catch { return null; }
  }).filter((item): item is { title: string; url: string; themes: string[] } => Boolean(item)).slice(0, 8);
}

export async function GET() {
  const sources = await Promise.all(publications.map(async (publication) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(publication.url, { signal: controller.signal, headers: { "User-Agent": "MarketIntelligencePublicationMonitor/1.0" }, cache: "no-store" });
      clearTimeout(timer);
      if (!response.ok) return { ...publication, status: "unavailable", error: `Source returned ${response.status}.`, articles: [] };
      return { ...publication, status: "live", articles: articles(publication.url, await response.text()) };
    } catch (error) {
      return { ...publication, status: "unavailable", error: error instanceof Error ? error.message : "Source could not be reached.", articles: [] };
    }
  }));
  return NextResponse.json({ refreshedAt: new Date().toISOString(), sources });
}
