import { inflateRawSync } from "node:zlib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function decodeXml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

function zipEntries(buffer: Buffer) {
  const entries: Array<{ name: string; data: Buffer }> = [];
  let offset = 0;
  while (offset + 30 < buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) { offset += 1; continue; }
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const name = buffer.subarray(offset + 30, offset + 30 + nameLength).toString("utf8");
    const dataStart = offset + 30 + nameLength + extraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    if (compressedSize > 0 && (method === 0 || method === 8)) {
      try { entries.push({ name, data: method === 8 ? inflateRawSync(compressed) : compressed }); } catch { /* keep processing other entries */ }
    }
    offset = dataStart + compressedSize;
  }
  return entries;
}

function extractOffice(buffer: Buffer, extension: string) {
  const entries = zipEntries(buffer);
  if (extension === "docx") {
    return entries.filter((entry) => entry.name === "word/document.xml" || entry.name.startsWith("word/header") || entry.name.startsWith("word/footer")).map((entry) => decodeXml(entry.data.toString("utf8"))).join("\n");
  }
  if (extension === "pptx") {
    return entries.filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map((entry, index) => `Slide ${index + 1}: ${decodeXml(entry.data.toString("utf8"))}`).join("\n");
  }
  const shared = entries.find((entry) => entry.name === "xl/sharedStrings.xml");
  const strings = shared ? [...shared.data.toString("utf8").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((item) => decodeXml(item[1])) : [];
  return entries.filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map((entry, index) => {
    const xml = entry.data.toString("utf8");
    const cells = [...xml.matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)].map((cell) => {
      const value = cell[2].match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
      return /t=["']s["']/.test(cell[1]) ? strings[Number(value)] ?? value : decodeXml(value);
    }).filter(Boolean);
    return `Worksheet ${index + 1}: ${cells.join(" | ")}`;
  }).join("\n");
}

function extractPdf(buffer: Buffer) {
  const binary = buffer.toString("latin1");
  const text = [...binary.matchAll(/\(((?:\\.|[^\\)])*)\)\s*(?:Tj|')/g)].map((item) => item[1].replace(/\\([()\\])/g, "$1")).join(" ");
  return text.replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file supplied." }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "File exceeds the 12 MB analysis limit." }, { status: 413 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";
  if (["txt", "md", "csv", "json", "html", "htm", "xml", "tsv"].includes(extension)) text = buffer.toString("utf8");
  else if (["docx", "pptx", "xlsx"].includes(extension)) text = extractOffice(buffer, extension);
  else if (extension === "pdf") text = extractPdf(buffer);
  else return NextResponse.json({ error: `.${extension || "unknown"} files are not supported yet.` }, { status: 415 });
  const cleaned = text.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 120000);
  if (!cleaned) return NextResponse.json({ error: "No readable text was extracted. Scanned PDFs require OCR before upload." }, { status: 422 });
  return NextResponse.json({ name: file.name, size: file.size, characters: cleaned.length, text: cleaned });
}
