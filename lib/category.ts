import type { PostFrontMatter } from "@/lib/posts";

export type PostCategory = NonNullable<PostFrontMatter["category"]>;

const CATEGORY_LABELS: Record<PostCategory, string> = {
  banking: "Banking",
  "data-science": "Data Science",
  "data-engineering": "Data Engineering",
  "gen-ai": "Gen AI",
};

const CATEGORY_PILL_CLASSES: Record<PostCategory, string> = {
  banking: "bg-amber-500/12 text-amber-800 dark:text-amber-200",
  "data-science": "bg-sky-500/12 text-sky-800 dark:text-sky-200",
  "data-engineering": "bg-indigo-500/12 text-indigo-800 dark:text-indigo-200",
  "gen-ai": "bg-purple-500/12 text-purple-800 dark:text-purple-200",
};

export function getCategoryLabel(category: PostCategory | undefined): string {
  if (!category) return "Banking";
  return CATEGORY_LABELS[category];
}

export function getCategoryPillClasses(
  category: PostCategory | undefined,
): string {
  if (!category) return CATEGORY_PILL_CLASSES.banking;
  return CATEGORY_PILL_CLASSES[category];
}
