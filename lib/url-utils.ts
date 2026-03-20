/**
 * Normalize a user-entered URL.
 * Handles partial Reddit URLs like /r/sub/s/XYZ or r/sub/comments/XYZ
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  // Partial Reddit path: /r/... or r/...
  if (/^\/r\//i.test(trimmed) || /^r\//i.test(trimmed)) {
    return "https://www.reddit.com/" + trimmed.replace(/^\//, "");
  }
  return trimmed;
}

/**
 * Detect what kind of URL this is for routing to the right extractor.
 */
export function detectUrlType(url: string): "tweet" | "reddit" | "generic" | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("twitter.com") || u.hostname.includes("x.com")) return "tweet";
    if (u.hostname.includes("reddit.com")) return "reddit";
    if (u.protocol === "http:" || u.protocol === "https:") return "generic";
    return null;
  } catch {
    return null;
  }
}
