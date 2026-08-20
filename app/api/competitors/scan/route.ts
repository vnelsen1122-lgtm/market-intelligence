import { NextResponse } from "next/server";
import { competitors } from "../../../competitor-data";
import { deepCompetitorIntelligence } from "../../../competitor-intelligence";

export const dynamic = "force-dynamic";

const signalTerms = {
  "AI & automation": ["artificial intelligence", " ai ", "assistant", "copilot", "predictive", "machine learning"],
  "Product and modules": ["platform", "module", "software", "workflow", "mobile", "offline"],
  "Customer proof": ["case study", "customer story", "success story", "trusted by"],
  "Corporate activity": ["acquisition", "acquired", "merger", "investment", "partnership"],
  "Messaging": ["all-in-one", "connected", "unified", "operational intelligence", "workforce"],
};

function clean(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&quot;/gi, '"').replace(/\s+/g, " ").trim();
}

function match(html: string, expression: RegExp) {
  return clean(html.match(expression)?.[1] ?? "");
}

function extractPage(url: string, html: string) {
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i)
    || match(html, /<meta[^>]+content=["']([\s\S]*?)["'][^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*>/i);
  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)].map((item) => clean(item[1])).filter(Boolean).slice(0, 12);
  const text = clean(html).slice(0, 20000);
  const normalized = ` ${text.toLowerCase()} `;
  const signals = Object.entries(signalTerms).filter(([, terms]) => terms.some((term) => normalized.includes(term))).map(([label]) => label);
  return { url, title: title || new URL(url).hostname, description: description.slice(0, 420), headings, signals, observedAt: new Date().toISOString() };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { competitorId?: string };
  const competitor = competitors.find((item) => item.id === body.competitorId);
  if (!competitor) return NextResponse.json({ error: "Unknown competitor." }, { status: 400 });

  const intelligence = deepCompetitorIntelligence[competitor.id];
  const urls = [...new Set([
    competitor.officialUrl,
    ...competitor.monitoredSurfaces.map((surface) => surface.url),
    ...(intelligence?.sources.map((source) => source.url) ?? []),
  ])].slice(0, 8);

  const pages = await Promise.all(urls.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "MarketIntelligenceSourceMonitor/1.0" }, cache: "no-store" });
      clearTimeout(timer);
      if (!response.ok) return { url, error: `Source returned ${response.status}.` };
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) return { url, error: "Linked source is not an HTML page; retained in the evidence register." };
      return extractPage(url, await response.text());
    } catch (error) {
      return { url, error: error instanceof Error ? error.message : "Source could not be reached." };
    }
  }));

  return NextResponse.json({ competitorId: competitor.id, company: competitor.name, scannedAt: new Date().toISOString(), pages });
}
