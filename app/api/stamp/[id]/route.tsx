import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getPost(id: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}&select=slop_score,roast&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] ?? null;
}

function getColor(score: number) {
  if (score <= 20) return "#71717a";
  if (score <= 40) return "#4ade80";
  if (score <= 60) return "#facc15";
  if (score <= 80) return "#fb923c";
  return "#facc15";
}

function getTier(score: number) {
  if (score <= 20) return "BARELY SLOP";
  if (score <= 40) return "CERTIFIED SLOP";
  if (score <= 60) return "PREMIUM GARBAGE";
  if (score <= 80) return "WEAPONS-GRADE SLOP";
  return "LEGENDARY FILTH";
}

function getEmoji(score: number) {
  if (score <= 20) return "😬";
  if (score <= 40) return "🗑️";
  if (score <= 60) return "💩";
  if (score <= 80) return "☣️";
  return "👑";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return new Response("Not found", { status: 404 });

  const color = getColor(post.slop_score);
  const tier = getTier(post.slop_score);
  const emoji = getEmoji(post.slop_score);
  const roast = post.roast.length > 100 ? post.roast.slice(0, 99) + "…" : post.roast;

  return new ImageResponse(
    (
      <div
        style={{
          width: 600,
          height: 600,
          background: "#09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 520,
            height: 520,
            background: "#18181b",
            borderRadius: 12,
            border: `5px dashed ${color}`,
            boxShadow: `0 0 40px ${color}40`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "32px 48px",
            gap: 0,
          }}
        >
          <div style={{ color: "#71717a", fontSize: 11, fontWeight: 700, letterSpacing: 5, marginBottom: 16, display: "flex" }}>
            AI SLOP JUDGE
          </div>
          <div style={{ fontSize: 52, marginBottom: 8, display: "flex" }}>{emoji}</div>
          <div style={{ color, fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 4, display: "flex" }}>
            {tier}
          </div>
          <div style={{ color: "#ffffff", fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 20, display: "flex" }}>
            {post.slop_score}%
          </div>
          <div style={{ width: 300, height: 1, background: `${color}50`, marginBottom: 20, display: "flex" }} />
          <div style={{ color: "#a1a1aa", fontSize: 14, fontStyle: "italic", lineHeight: 1.5, maxWidth: 380, textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {`"${roast}"`}
          </div>
          <div style={{ color: "#71717a", fontSize: 11, letterSpacing: 3, marginTop: 20, display: "flex" }}>
            AISLOP.COM
          </div>
        </div>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
