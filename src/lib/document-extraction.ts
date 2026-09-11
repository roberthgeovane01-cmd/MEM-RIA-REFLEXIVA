// Client-side text extraction for the MVP formats from docs/specs/MR-04 and
// docs/DATA_MODEL.md ("MVP: TXT, Markdown, DOCX textual, PDF com camada de
// texto"). Runs synchronously in the browser at upload time — no queue/job
// yet, that's Fase 3 (see docs/ROADMAP.md). Scanned/image-only PDFs (no text
// layer) are explicitly out of scope here; OCR is a later phase.

export type SupportedExtension = "txt" | "md" | "pdf" | "docx";

const EXTENSION_BY_SUFFIX: Record<string, SupportedExtension> = {
  ".txt": "txt",
  ".md": "md",
  ".pdf": "pdf",
  ".docx": "docx",
};

export function detectExtension(filename: string): SupportedExtension | null {
  const lower = filename.toLowerCase();
  for (const [suffix, ext] of Object.entries(EXTENSION_BY_SUFFIX)) {
    if (lower.endsWith(suffix)) return ext;
  }
  return null;
}

export const ACCEPTED_FILE_EXTENSIONS = Object.keys(EXTENSION_BY_SUFFIX);

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n").trim();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

/**
 * Extracts plain text from a supported file. Throws a user-facing message
 * (in Portuguese, shown directly in the Adicionar Conteúdo form) if the
 * format isn't supported or the file has no extractable text — e.g. a
 * scanned PDF with no text layer.
 */
export async function extractText(file: File): Promise<string> {
  const extension = detectExtension(file.name);

  if (!extension) {
    throw new Error(
      `Formato não suportado. No momento aceitamos: ${ACCEPTED_FILE_EXTENSIONS.join(", ")}.`,
    );
  }

  let text: string;
  switch (extension) {
    case "txt":
    case "md":
      text = (await file.text()).trim();
      break;
    case "pdf":
      text = await extractPdfText(file);
      break;
    case "docx":
      text = await extractDocxText(file);
      break;
  }

  if (!text) {
    throw new Error(
      extension === "pdf"
        ? "Não encontramos texto neste PDF — pode ser um documento escaneado (sem camada de texto). OCR ainda não é suportado."
        : "Não foi possível extrair texto deste arquivo.",
    );
  }

  return text;
}
