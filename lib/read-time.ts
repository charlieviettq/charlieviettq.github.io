const WORDS_PER_MINUTE = 200;

export function estimateReadTimeMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_\[\]()!|`~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadTime(minutes: number, lang: "vi" | "en"): string {
  if (lang === "vi") {
    return `${minutes} phút đọc`;
  }
  return `${minutes} min read`;
}
