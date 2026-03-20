import { describe, it, expect } from "vitest";
import { normalizeUrl, detectUrlType } from "../url-utils";

describe("normalizeUrl", () => {
  it("leaves full URLs untouched", () => {
    expect(normalizeUrl("https://www.reddit.com/r/sub/comments/abc/title/")).toBe(
      "https://www.reddit.com/r/sub/comments/abc/title/"
    );
  });

  it("expands /r/ partial path to full Reddit URL", () => {
    expect(normalizeUrl("/r/PredictionsMarkets/s/dS7DrILpPc")).toBe(
      "https://www.reddit.com/r/PredictionsMarkets/s/dS7DrILpPc"
    );
  });

  it("expands r/ partial path (no leading slash) to full Reddit URL", () => {
    expect(normalizeUrl("r/PredictionsMarkets/s/dS7DrILpPc")).toBe(
      "https://www.reddit.com/r/PredictionsMarkets/s/dS7DrILpPc"
    );
  });

  it("leaves twitter URLs untouched", () => {
    expect(normalizeUrl("https://x.com/user/status/123")).toBe("https://x.com/user/status/123");
  });

  it("trims whitespace", () => {
    expect(normalizeUrl("  https://reddit.com/r/sub/comments/abc  ")).toBe(
      "https://reddit.com/r/sub/comments/abc"
    );
  });
});

describe("detectUrlType", () => {
  it("detects twitter.com as tweet", () => {
    expect(detectUrlType("https://twitter.com/user/status/123")).toBe("tweet");
  });

  it("detects x.com as tweet", () => {
    expect(detectUrlType("https://x.com/user/status/123")).toBe("tweet");
  });

  it("detects reddit.com as reddit", () => {
    expect(detectUrlType("https://www.reddit.com/r/sub/comments/abc")).toBe("reddit");
  });

  it("detects reddit share link as reddit after normalization", () => {
    const normalized = normalizeUrl("/r/PredictionsMarkets/s/dS7DrILpPc");
    expect(detectUrlType(normalized)).toBe("reddit");
  });

  it("detects generic https URL", () => {
    expect(detectUrlType("https://medium.com/some-article")).toBe("generic");
  });

  it("returns null for invalid URL", () => {
    expect(detectUrlType("not a url")).toBeNull();
  });

  it("returns null for partial /r/ path (before normalization)", () => {
    expect(detectUrlType("/r/PredictionsMarkets/s/abc")).toBeNull();
  });
});
