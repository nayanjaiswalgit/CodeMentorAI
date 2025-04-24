import type { Express } from "express";
import pdfParse from "pdf-parse";
import fs from "fs/promises";

/**
 * Extract text from a PDF (optionally, for specific pages or by section keyword)
 */
export async function extractTextFromPdf(filePath: string, options?: { pageRange?: [number, number], keyword?: string }): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);
  let text = pdfData.text;
  if (options?.pageRange) {
    // Split by pages and extract only the requested range
    const pages = text.split(/\f|\n\s*\n/); // crude page split
    const [start, end] = options.pageRange;
    text = pages.slice(start - 1, end).join("\n\n");
  } else if (options?.keyword) {
    // Find the section containing the keyword
    const idx = text.toLowerCase().indexOf(options.keyword.toLowerCase());
    if (idx !== -1) {
      text = text.slice(idx, idx + 3000); // extract 3000 chars from keyword
    }
  }
  return text;
}
