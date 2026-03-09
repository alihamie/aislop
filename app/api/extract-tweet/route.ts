import { NextRequest, NextResponse } from "next/server";

function stripHtml(html: string): string {
  // Decode common HTML entities
  const decoded = html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  // Strip HTML tags
  return decoded.replace(/<[^>]+>/g, "").trim();
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate URL: must be twitter.com or x.com with /status/ in path
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const validHosts = ["twitter.com", "www.twitter.com", "x.com", "www.x.com"];
  if (!validHosts.includes(parsed.hostname) || !parsed.pathname.includes("/status/")) {
    return NextResponse.json(
      { error: "URL must be a Twitter/X post (twitter.com or x.com with /status/ in path)" },
      { status: 400 }
    );
  }

  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;

  try {
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "AISlop/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch tweet. It may be private or deleted." },
        { status: 404 }
      );
    }

    const data = await res.json();
    const html: string = data.html ?? "";

    // Extract just the tweet body from inside the <p> tag
    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const rawText = pMatch ? pMatch[1] : html;

    const text = stripHtml(rawText)
      // Remove pic.twitter.com/xxx media links
      .replace(/pic\.twitter\.com\/\S+/g, "")
      // Remove t.co shortened URLs (media attachments at end of tweet)
      .replace(/https?:\/\/t\.co\/\S+/g, "")
      // Remove trailing "…" truncation marker
      .replace(/…\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const author = (data.author_name as string | undefined) ?? "";

    return NextResponse.json({ text, author });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tweet" }, { status: 500 });
  }
}
