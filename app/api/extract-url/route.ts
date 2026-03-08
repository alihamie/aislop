import { NextRequest, NextResponse } from "next/server";

const MAX_TEXT = 3000;

function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).trim();
}

// Extract a meta tag content (og:description, description, etc.)
function getMeta(html: string, ...names: string[]): string {
  for (const name of names) {
    const m =
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']{10,})["']`, "i")) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']{10,})["'][^>]+(?:property|name)=["']${name}["']`, "i"));
    if (m?.[1]) return decodeEntities(m[1]).trim();
  }
  return "";
}

// Extract content from the most likely "main content" element
function extractMainContent(html: string): string {
  // Remove noisy blocks first
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove comment sections
    .replace(/<[^>]*(comment|reaction|like-count|social-count|follow)[^>]*>[\s\S]*?<\/[^>]+>/gi, "");

  // Try to find the main content container
  const candidates = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
    /<[^>]+class=["'][^"']*(?:post-content|article-body|entry-content|content-body|feed-shared-update-v2)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
  ];

  for (const pattern of candidates) {
    const m = cleaned.match(pattern);
    if (m?.[1]) {
      const text = stripTags(m[1]).replace(/\s{3,}/g, "\n\n").trim();
      if (text.length > 100) return text;
    }
  }

  // Fallback: strip everything
  return stripTags(cleaned).replace(/\s{3,}/g, "\n\n").trim();
}

function cleanTitle(title: string, hostname: string): string {
  // Remove common site name suffixes
  return title
    .replace(/\s*[|\-–—]\s*(LinkedIn|Medium|Substack|Twitter|X|Reddit|Facebook|Instagram)[^\n]*/gi, "")
    .replace(/\s*[|\-–—]\s*[A-Z][a-zA-Z\s]+$/, "") // generic "| Site Name" suffix
    .trim()
    .slice(0, 120);
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "URL must use http or https" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AISlop/1.0)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      const msg =
        res.status === 403 ? "This page blocked access. Try pasting the text manually." :
        res.status === 404 ? "Page not found (404)." :
        `Could not fetch page (HTTP ${res.status}).`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const html = await res.text();

    // 1. Try OG/meta description first — usually the cleanest post text
    const ogDesc = getMeta(html, "og:description", "description", "twitter:description");

    // 2. Try to extract main article content
    const mainContent = extractMainContent(html);

    // 3. Title — prefer OG title, fall back to <title>
    const rawTitle =
      getMeta(html, "og:title", "twitter:title") ||
      (() => { const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? stripTags(m[1]) : ""; })();
    const title = cleanTitle(rawTitle, parsed.hostname);

    // Pick best text: prefer main content if it's meaningfully longer than og:desc
    // But cap at MAX_TEXT chars
    let text = "";
    if (mainContent.length > (ogDesc.length * 1.5) && mainContent.length > 200) {
      text = mainContent.slice(0, MAX_TEXT);
    } else if (ogDesc.length > 50) {
      text = ogDesc.slice(0, MAX_TEXT);
    } else {
      text = mainContent.slice(0, MAX_TEXT);
    }

    if (!text || text.length < 30) {
      return NextResponse.json({ error: "Couldn't extract meaningful content. Try pasting the text manually." }, { status: 422 });
    }

    return NextResponse.json({ text, title });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch page. It may have blocked the request." },
      { status: 500 }
    );
  }
}
