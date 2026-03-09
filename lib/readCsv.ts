import fs from "fs";
import path from "path";

export interface CsvRow {
  questionType: string;
  structure: string;
  tips: string;
  mistakes: string;
}

export interface VocabRow {
  band: number;
  task: number;
  vocabItem: string;
  category: string;
}

/** Minimal RFC-4180 CSV parser — no external dependencies. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const row: string[] = [];

    while (i < len) {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = "";
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            field += text[i++];
          }
        }
        row.push(field);
        if (i < len && text[i] === ",") i++;
        else break; // comma or end-of-row
      } else if (text[i] === "\r" || text[i] === "\n") {
        break; // end of row
      } else {
        // Unquoted field
        let field = "";
        while (i < len && text[i] !== "," && text[i] !== "\r" && text[i] !== "\n") {
          field += text[i++];
        }
        row.push(field.trim());
        if (i < len && text[i] === ",") i++;
        else break;
      }
    }

    // Skip line ending
    if (i < len && text[i] === "\r") i++;
    if (i < len && text[i] === "\n") i++;

    if (row.length > 0 && row.some((f) => f !== "")) rows.push(row);
  }

  return rows;
}

function toCsvRows(rows: string[][]): CsvRow[] {
  // Slice off the header row
  return rows.slice(1).map((r) => ({
    questionType: r[0] ?? "",
    structure: r[1] ?? "",
    tips: r[2] ?? "",
    mistakes: r[3] ?? "",
  }));
}

export function readTask1Csv(): CsvRow[] {
  const file = path.join(process.cwd(), "Task 1.csv");
  return toCsvRows(parseCsv(fs.readFileSync(file, "utf-8")));
}

export function readTask2Csv(): CsvRow[] {
  const file = path.join(process.cwd(), "Task 2.csv");
  return toCsvRows(parseCsv(fs.readFileSync(file, "utf-8")));
}

export function readVocabCsv(): VocabRow[] {
  const file = path.join(process.cwd(), "ielts_writing_vocab_by_band.csv");
  if (!fs.existsSync(file)) return [];
  const rows = parseCsv(fs.readFileSync(file, "utf-8"));
  return rows.slice(1).map((r) => ({
    band: parseInt(r[0], 10) || 0,
    task: parseInt(r[1], 10) || 0,
    vocabItem: r[2] ?? "",
    category: r[3] ?? "",
  }));
}
