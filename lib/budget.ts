/**
 * Budget domain constants and helpers.
 * File naming convention: YEAR_BUDGET_STUDIONAME (e.g. 2026_BUDGET_5OAK).
 */

export const BUDGET_YEAR = 2026;

/** Studios shown on the budget dashboard; slug is used in URLs. */
export const STUDIOS = [
  { slug: "5oak", name: "5OAK" },
  { slug: "optimal-games", name: "OPTIMAL GAMES" },
  { slug: "intelligate", name: "INTELLIGATE" },
] as const;

/** Slug for the combined (all-studios) summary route. */
export const COMBINED_SLUG = "combined" as const;

export type StudioSlug = (typeof STUDIOS)[number]["slug"] | typeof COMBINED_SLUG;

/** Builds the budget document id string for a given year and studio name. */
export function getBudgetId(year: number, studioName: string): string {
  return `${year}_BUDGET_${studioName}`;
}

/** Resolves a URL slug to the studio config, or null if not found. */
export function getStudioBySlug(slug: string): (typeof STUDIOS)[number] | null {
  return STUDIOS.find((s) => s.slug === slug) ?? null;
}

/** True if the slug is the combined summary (not a single studio). */
export function isCombined(slug: string): boolean {
  return slug === COMBINED_SLUG;
}

/** Type guard: true if slug is a valid studio or "combined". */
export function isValidStudioSlug(slug: string): slug is StudioSlug {
  return (
    slug === COMBINED_SLUG || STUDIOS.some((s) => s.slug === slug)
  );
}
