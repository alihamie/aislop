/**
 * Normalize a user-entered URL.
 * Handles partial Reddit URLs like:
 *   - /r/sub/s/XYZ  (leading slash path)
 *   - r/sub/s/XYZ   (no leading slash)
 *   - reddit.com/r/sub/s/XYZ  (missing protocol)
 *   - ddit.com/r/sub/s/XYZ   (truncated paste from mobile)
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();

  // Already a valid full URL — leave it alone
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Partial Reddit path: /r/... or r/...
  if (/^\/r\//i.test(trimmed) || /^r\//i.test(trimmed)) {
    return "https://www.reddit.com/" + trimmed.replace(/^\//, "");
  }

  // Missing protocol but has reddit hostname (full or truncated: reddit.com, ddit.com, eddit.com, etc.)
  // Matches anything ending in "ddit.com" to catch mobile truncation like "ddit.com/r/..."
  if (/(?:reddit|ddit|eddit)\.com\//i.test(trimmed)) {
    const redditPath = trimmed.replace(/^.*?ddit\.com\//i, "");
    return "https://www.reddit.com/" + redditPath;
  }

  // No protocol at all but looks like a domain — prepend https://
  if (/^[a-zA-Z0-9]/.test(trimmed) && trimmed.includes(".") && !trimmed.includes(" ")) {
    return "https://" + trimmed;
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
