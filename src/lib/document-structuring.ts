// Deterministic, AI-free structuring + chunking for Fase 3 (Ingestão) — see
// docs/DATA_MODEL.md ("Fase 3 — Ingestão / estrutura documental") and
// docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md §17 ("chunking será
// estruturalmente consciente: primeiro respeitar capítulo → seção →
// parágrafo, depois aplicar limite de tamanho"). No provider/secret is
// needed here — that's why this can run client-side (see docs/DECISIONS.md).

export type SectionType = "book" | "part" | "chapter" | "section" | "subtitle" | "page";

export interface StructuredSection {
  sectionType: SectionType;
  title: string | null;
  sequence: number;
  /** Index into the same array, or null for a top-level section. */
  parentIndex: number | null;
  textContent: string;
}

export interface StructuredChunk {
  /** Index into the sections array this chunk was cut from. */
  sectionIndex: number;
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/;

const LEVEL_TO_TYPE: Record<number, SectionType> = {
  1: "chapter",
  2: "section",
  3: "subtitle",
  4: "subtitle",
  5: "subtitle",
  6: "subtitle",
};

/**
 * Splits text into a section tree using Markdown-style `#` headings when
 * present. Documents with no detectable heading structure (plain TXT, most
 * PDF/DOCX extractions) come back as a single 'section' holding the whole
 * text — never split blindly.
 */
export function buildSections(text: string): StructuredSection[] {
  const lines = text.split(/\r?\n/);
  const headings: { level: number; title: string; startLine: number }[] = [];
  lines.forEach((line, i) => {
    const match = HEADING_RE.exec(line.trim());
    if (match) headings.push({ level: match[1]!.length, title: match[2]!.trim(), startLine: i });
  });

  if (headings.length === 0) {
    const trimmed = text.trim();
    return trimmed
      ? [
          {
            sectionType: "section",
            title: null,
            sequence: 0,
            parentIndex: null,
            textContent: trimmed,
          },
        ]
      : [];
  }

  const sections: StructuredSection[] = [];
  const stack: { level: number; index: number }[] = [];

  const preface = lines.slice(0, headings[0]!.startLine).join("\n").trim();
  if (preface) {
    sections.push({
      sectionType: "section",
      title: null,
      sequence: 0,
      parentIndex: null,
      textContent: preface,
    });
  }

  headings.forEach((heading, i) => {
    const start = heading.startLine + 1;
    const end = i + 1 < headings.length ? headings[i + 1]!.startLine : lines.length;
    const textContent = lines.slice(start, end).join("\n").trim();

    while (stack.length > 0 && stack[stack.length - 1]!.level >= heading.level) {
      stack.pop();
    }
    const parentIndex = stack.length > 0 ? stack[stack.length - 1]!.index : null;

    const sectionIndex = sections.length;
    sections.push({
      sectionType: LEVEL_TO_TYPE[Math.min(heading.level, 6)] ?? "subtitle",
      title: heading.title,
      sequence: sectionIndex,
      parentIndex,
      // A heading with no body text still needs non-empty text_content —
      // fall back to the heading title itself.
      textContent: textContent || heading.title,
    });
    stack.push({ level: heading.level, index: sectionIndex });
  });

  return sections;
}

const MAX_CHUNK_CHARS = 1200;

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Last-resort split for a single paragraph longer than the chunk limit — cuts on whitespace, never mid-word. */
function splitOversizedParagraph(paragraph: string): string[] {
  if (paragraph.length <= MAX_CHUNK_CHARS) return [paragraph];

  const words = paragraph.split(/\s+/);
  const parts: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > MAX_CHUNK_CHARS && current) {
      parts.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** ~4 chars/token is a rough approximation — good enough for progress/UI until Fase 4 picks a real tokenizer. */
function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Greedily packs paragraphs into chunks up to MAX_CHUNK_CHARS, respecting
 * section boundaries (a chunk never spans two sections) and paragraph
 * boundaries (only split a single paragraph if it alone exceeds the limit).
 */
export function buildChunks(sections: StructuredSection[]): StructuredChunk[] {
  const chunks: StructuredChunk[] = [];
  let chunkIndex = 0;

  sections.forEach((section, sectionIndex) => {
    const paragraphs = splitParagraphs(section.textContent).flatMap(splitOversizedParagraph);
    let current = "";

    const flush = () => {
      if (!current) return;
      chunks.push({
        sectionIndex,
        chunkIndex: chunkIndex++,
        content: current,
        tokenCount: estimateTokenCount(current),
      });
      current = "";
    };

    for (const paragraph of paragraphs) {
      const next = current ? `${current}\n\n${paragraph}` : paragraph;
      if (next.length > MAX_CHUNK_CHARS && current) {
        flush();
        current = paragraph;
      } else {
        current = next;
      }
    }
    flush();
  });

  return chunks;
}
