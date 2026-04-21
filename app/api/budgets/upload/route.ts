/**
 * POST /api/budgets/upload
 * Multipart form field: "files" (one or more .xlsx files).
 * Filename must match: YYYY_BUDGET_StudioName.xlsx (e.g. 2026_BUDGET_5OAK.xlsx).
 * Each file is parsed and stored in MySQL (Budget table) keyed by studio and year.
 * Returns { ok: true, studios: string[] } with the list of studios that were updated.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { sheetToRowsWithFormulaValues } from "@/lib/xlsxParse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    const xlsxFiles = files.filter(
      (f) => f.name && f.name.toLowerCase().endsWith(".xlsx")
    );

    if (!xlsxFiles.length) {
      return NextResponse.json(
        { error: "No .xlsx files uploaded." },
        { status: 400 }
      );
    }

    const studios = new Set<string>();

    for (const file of xlsxFiles) {
      const originalFilename = file.name || "";
      const match = /^(\d{4})_BUDGET_(.+)\.xlsx$/i.exec(originalFilename);
      if (!match) continue;

      const year = Number(match[1]);
      const studioName = match[2].toUpperCase();
      studios.add(studioName);

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, {
          type: "buffer",
          cellFormula: true,
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) continue;

        const normalizedRows = sheetToRowsWithFormulaValues(sheet);

        await prisma.budget.upsert({
          where: {
            studio_year: { studio: studioName, year },
          },
          create: {
            studio: studioName,
            year,
            rows: normalizedRows as unknown as object,
          },
          update: {
            rows: normalizedRows as unknown as object,
          },
        });
      } catch (e) {
        console.error("Failed to serialize XLSX for", originalFilename, e);
      }
    }

    return NextResponse.json({
      ok: true,
      studios: Array.from(studios),
    });
  } catch (error) {
    console.error("Upload budgets error:", error);
    return NextResponse.json(
      { error: "Failed to upload budget files." },
      { status: 500 }
    );
  }
}
