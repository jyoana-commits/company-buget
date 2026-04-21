/**
 * Excel sheet parser: reads a SheetJS worksheet into a 2D array of strings.
 * Formula cells are evaluated so the result is the calculated value (e.g. =SUM(C6-D6) → number).
 *
 * Flow:
 * 1. Build initial grid from cell values (v or formatted w); formula cells start with v if cached, else "".
 * 2. Evaluate all formula cells using the grid; multiple passes until stable (for dependent formulas).
 * 3. Return the final string[][] grid.
 */

import * as XLSX from "xlsx";

// --- Cell value → string (for non-formula cells) ---

function cellValueToString(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

// --- A1-style refs: column letter → 0-based index ---

/** A=0, B=1, ..., Z=25, AA=26, ... */
function colToIndex(col: string): number {
  const letters = col.replace(/\d+$/, "").toUpperCase();
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64);
  }
  return n - 1;
}

/** "A1" or "C6" → { r: 0-based row, c: 0-based col }. Strips $ from ref. */
function refToRC(ref: string): { r: number; c: number } {
  const normalized = ref.replace(/\$/g, "").toUpperCase();
  const match = normalized.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { r: -1, c: -1 };
  return {
    r: parseInt(match[2], 10) - 1,
    c: colToIndex(match[1]),
  };
}

/** Parse a number from a cell string (handles commas, (123) = negative). */
function parseNum(s: string): number {
  if (s == null || String(s).trim() === "") return 0;
  const t = String(s).trim().replace(/,/g, "");
  if (t.startsWith("(") && t.endsWith(")")) {
    const inner = parseFloat(t.slice(1, -1));
    return Number.isNaN(inner) ? 0 : -inner;
  }
  const n = parseFloat(t);
  return Number.isNaN(n) ? 0 : n;
}

// --- Grid access with sheet range offset ---

/** Get numeric value from grid at sheet row R, sheet col C (0-based). */
function getValue(
  grid: string[][],
  sheetR: number,
  sheetC: number,
  row0: number,
  col0: number
): number {
  const ri = sheetR - row0;
  const ci = sheetC - col0;
  if (ri < 0 || ci < 0 || ri >= grid.length) return 0;
  const row = grid[ri];
  if (!row || ci >= row.length) return 0;
  return parseNum(row[ci]);
}

/**
 * Sum over a range (e.g. E6:E10). start/end are refs like "E6", "E10".
 * If skipCell is set and (r,c) equals skipCell, that cell is treated as 0 (avoids circular ref).
 */
function getRangeSum(
  grid: string[][],
  startRef: string,
  endRef: string,
  row0: number,
  col0: number,
  skipCell?: { r: number; c: number }
): number {
  const start = refToRC(startRef);
  const end = refToRC(endRef);
  if (start.r < 0 || start.c < 0 || end.r < 0 || end.c < 0) return 0;
  const rMin = Math.min(start.r, end.r);
  const rMax = Math.max(start.r, end.r);
  const cMin = Math.min(start.c, end.c);
  const cMax = Math.max(start.c, end.c);
  let sum = 0;
  for (let r = rMin; r <= rMax; r++) {
    for (let c = cMin; c <= cMax; c++) {
      if (skipCell && skipCell.r === r && skipCell.c === c) continue;
      sum += getValue(grid, r, c, row0, col0);
    }
  }
  return sum;
}

// --- Formula evaluation ---

/**
 * Replace ranges (e.g. E6:E10, $E$6:$E$10) in formula with their sum.
 * currentCell: if the formula is inside this range, that cell is excluded from the sum (circular ref).
 */
function replaceRanges(
  formula: string,
  grid: string[][],
  row0: number,
  col0: number,
  currentCell?: { r: number; c: number }
): string {
  const rangeRegex = /\$?\s*([A-Z]+)\$?\s*(\d+)\s*:\s*\$?\s*([A-Z]+)\$?\s*(\d+)/gi;
  return formula.replace(rangeRegex, (_, col1, row1, col2, row2) => {
    const startRef = (col1 as string).toUpperCase() + row1;
    const endRef = (col2 as string).toUpperCase() + row2;
    const sum = getRangeSum(grid, startRef, endRef, row0, col0, currentCell);
    return String(sum);
  });
}

/** Replace single cell refs (e.g. A1, $C$6) with numeric value from grid. */
function replaceRefs(
  formula: string,
  grid: string[][],
  row0: number,
  col0: number
): string {
  const refRegex = /\$?([A-Z]+)\$?(\d+)(?!\s*:)/g;
  return formula.replace(refRegex, (match) => {
    const rc = refToRC(match);
    if (rc.r < 0 || rc.c < 0) return "0";
    const val = getValue(grid, rc.r, rc.c, row0, col0);
    return String(val);
  });
}

/**
 * Evaluate one formula string using current grid.
 * Supports: =C6-D6, =SUM(C6-D6), =SUM(E6:E10), $ refs, semicolon or comma.
 * currentCell: sheet row/col of the cell being evaluated (for circular ref in ranges).
 * Returns numeric result or null on error.
 */
function evaluateFormula(
  formulaStr: string,
  grid: string[][],
  row0: number,
  col0: number,
  currentCell?: { r: number; c: number }
): number | null {
  if (!formulaStr || typeof formulaStr !== "string") return null;
  let expr = formulaStr.trim();
  if (expr.startsWith("=")) expr = expr.slice(1).trim();
  if (!expr) return null;

  expr = expr.replace(/;/g, ",");
  expr = replaceRanges(expr, grid, row0, col0, currentCell);
  expr = replaceRefs(expr, grid, row0, col0);

  try {
    const SUM = (...args: number[]) => args.reduce((a, b) => a + b, 0);
    const result = new Function("SUM", "return (" + expr + ")")(SUM);
    if (typeof result !== "number" || Number.isNaN(result)) return null;
    return result;
  } catch {
    return null;
  }
}

// --- Main: build grid and evaluate formulas ---

/**
 * Build initial grid from sheet: each cell's value (v) or formatted text (w).
 * Formula cells use v if present (cached), else "" so we overwrite in next step.
 */
function buildInitialGrid(sheet: XLSX.WorkSheet, range: XLSX.Range): string[][] {
  const rows: string[][] = [];
  for (let R = range.s.r; R <= range.e.r; R++) {
    const row: string[] = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = sheet[ref] as { v?: unknown; w?: string } | undefined;
      let val: string;
      if (!cell) {
        val = "";
      } else if (cell.v !== undefined && cell.v !== null) {
        val = cellValueToString(cell.v);
      } else if (cell.w !== undefined && cell.w !== null) {
        val = String(cell.w);
      } else {
        val = "";
      }
      row.push(val);
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Run formula evaluation over the grid until no change (or max passes).
 * Each formula cell is recomputed from the current grid; order and dependencies
 * are handled by multiple passes.
 */
function evaluateFormulas(
  sheet: XLSX.WorkSheet,
  grid: string[][],
  range: XLSX.Range,
  row0: number,
  col0: number
): void {
  const maxPasses = 8;
  for (let pass = 0; pass < maxPasses; pass++) {
    let anyChange = false;
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const ref = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = sheet[ref] as { f?: string } | undefined;
        if (!cell?.f) continue;

        const rowIdx = R - row0;
        const colIdx = C - col0;
        if (rowIdx < 0 || colIdx < 0 || rowIdx >= grid.length) continue;
        const row = grid[rowIdx];
        if (!row || colIdx >= row.length) continue;

        const result = evaluateFormula(cell.f, grid, row0, col0, { r: R, c: C });
        if (result !== null) {
          // Round to 2 decimal places to avoid floating-point noise (e.g. 215252.46000000002 → 215252.46)
          const rounded =
            typeof result === "number"
              ? Math.round(result * 100) / 100
              : result;
          const str = String(rounded);
          if (row[colIdx] !== str) {
            row[colIdx] = str;
            anyChange = true;
          }
        }
      }
    }
    if (!anyChange) break;
  }
}

/**
 * Parse a worksheet into a 2D array of strings.
 * Formula cells are evaluated so each cell contains the result (e.g. number as string).
 *
 * @param sheet - SheetJS worksheet (from workbook.Sheets[name])
 * @returns string[][] with same logical dimensions as the sheet's used range
 */
export function sheetToRowsWithFormulaValues(sheet: XLSX.WorkSheet): string[][] {
  const ref = sheet["!ref"];
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);
  const row0 = range.s.r;
  const col0 = range.s.c;

  const grid = buildInitialGrid(sheet, range);
  evaluateFormulas(sheet, grid, range, row0, col0);

  return grid;
}
