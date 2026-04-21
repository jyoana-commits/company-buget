/**
 * File upload control for budget .xlsx files. POSTs to /api/budgets/upload.
 * Expects filenames like 2026_BUDGET_5OAK.xlsx. Shows success/error message after upload.
 * When onUploadSuccess is provided, it is called after a successful upload so the page can refresh and show/update the budget table immediately.
 */
"use client";

import { useState } from "react";

type UploadResponse = { ok: boolean; studios?: string[]; error?: string };

interface UploadBudgetsProps {
  /** Called after a successful upload; use e.g. router.replace(router.asPath) to refresh and show updated budget. */
  onUploadSuccess?: () => void;
}

export function UploadBudgets({ onUploadSuccess }: UploadBudgetsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const res = await fetch("/api/budgets/upload", { method: "POST", body: formData });
      const data = (await res.json()) as UploadResponse;

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Upload failed.");
        setLoading(false);
        return;
      }

      const loaded = (data.studios || []).map((s) => s.toUpperCase());
      setMessage(loaded.length > 0 ? `Loaded: ${loaded.join(", ")} — updating…` : "Files uploaded. No studios recognized.");
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch {
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-600 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40">
        <span>{loading ? "Uploading..." : "Upload .xlsx"}</span>
        <input
          type="file"
          accept=".xlsx"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={loading}
        />
      </label>
      {message && <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{message}</p>}
    </div>
  );
}
