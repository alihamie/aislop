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

  // Extract tweet ID from URL path
  const tweetIdMatch = parsed.pathname.match(/\/status\/(\d+)/);
  const tweetId = tweetIdMatch?.[1];

  if (!tweetId) {
    return NextResponse.json({ error: "Could not extract tweet ID from URL." }, { status: 400 });
  }

  try {
    // Try syndication API first — returns full untruncated text, no auth needed
    const syndicationUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en&features=tfw_timeline_list%3A%3Btfw_follower_count_sunset%3Atrue`;
    const synRes = await fetch(syndicationUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AISlop/1.0)",
        "Referer": "https://platform.twitter.com/",
      },
    });

    if (synRes.ok) {
      const synData = await synRes.json();
      // Full text is in `text` field; thread/quoted tweets in `quoted_tweet`
      const fullText: string = synData?.text ?? synData?.full_text ?? "";
      const author: string = synData?.user?.name ?? synData?.core?.user_results?.result?.legacy?.name ?? "";

      if (fullText) {
        const text = fullText
          .replace(/https?:\/\/t\.co\/\S+/g, "")  // strip t.co links
          .replace(/\s{2,}/g, " ")
          .trim();
        return NextResponse.json({ text, author });
      }
    }

    // Fallback: oEmbed (truncated but better than nothing)
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
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
    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const rawText = pMatch ? pMatch[1] : html;

    const text = stripHtml(rawText)
      .replace(/pic\.twitter\.com\/\S+/g, "")
      .replace(/https?:\/\/t\.co\/\S+/g, "")
      .replace(/…\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const author = (data.author_name as string | undefined) ?? "";
    return NextResponse.json({ text, author, truncated: true });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tweet" }, { status: 500 });
  }
}
