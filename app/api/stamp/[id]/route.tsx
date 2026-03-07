import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Use Node.js runtime (not edge) for Supabase compatibility
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getPost(id: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}&select=slop_score,roast,verdict&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] ?? null;
}

function getScoreColor(score: number): string {
  if (score <= 20) return "#71717a";
  if (score <= 40) return "#4ade80";
  if (score <= 60) return "#facc15";
  if (score <= 80) return "#fb923c";
  return "#facc15";
}

function getTierLabel(score: number): string {
  if (score <= 20) return "BARELY SLOP";
  if (score <= 40) return "CERTIFIED SLOP";
  if (score <= 60) return "PREMIUM GARBAGE";
  if (score <= 80) return "WEAPONS-GRADE SLOP";
  return "LEGENDARY FILTH";
}

function getTierEmoji(score: number): string {
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

  const color = getScoreColor(post.slop_score);
  const tier = getTierLabel(post.slop_score);
  const emoji = getTierEmoji(post.slop_score);
  const roast = post.roast.length > 120 ? post.roast.slice(0, 119) + "…" : post.roast;

  // Perforated dots for top/bottom
  const holeCount = 22;
  const topDots = Array.from({ length: holeCount }, (_, i) => (
    <div
      key={`t${i}`}
      style={{
        position: "absolute",
        top: 10,
        left: 14 + i * 24,
        width: 13,
        height: 13,
        borderRadius: "50%",
        background: "#09090b",
      }}
    />
  ));
  const bottomDots = Array.from({ length: holeCount }, (_, i) => (
    <div
      key={`b${i}`}
      style={{
        position: "absolute",
        bottom: 10,
        left: 14 + i * 24,
        width: 13,
        height: 13,
        borderRadius: "50%",
        background: "#09090b",
      }}
    />
  ));
  const leftDots = Array.from({ length: 18 }, (_, i) => (
    <div
      key={`l${i}`}
      style={{
        position: "absolute",
        top: 30 + i * 30,
        left: 10,
        width: 13,
        height: 13,
        borderRadius: "50%",
        background: "#09090b",
      }}
    />
  ));
  const rightDots = Array.from({ length: 18 }, (_, i) => (
    <div
      key={`r${i}`}
      style={{
        position: "absolute",
        top: 30 + i * 30,
        right: 10,
        width: 13,
        height: 13,
        borderRadius: "50%",
        background: "#09090b",
      }}
    />
  ));

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
        {/* Postage stamp */}
        <div
          style={{
            position: "relative",
            width: 540,
            height: 540,
            background: "#18181b",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${color}`,
            boxShadow: `0 0 40px ${color}40`,
          }}
        >
          {topDots}
          {bottomDots}
          {leftDots}
          {rightDots}

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "20px 60px",
              gap: 0,
            }}
          >
            <div style={{ color: "#52525b", fontSize: 11, fontWeight: 700, letterSpacing: 5, marginBottom: 14 }}>
              AI SLOP JUDGE
            </div>
            <div style={{ fontSize: 52, marginBottom: 6 }}>{emoji}</div>
            <div style={{ color, fontSize: 24, fontWeight: 900, letterSpacing: 2, marginBottom: 2 }}>
              {tier}
            </div>
            <div style={{ color: "#fff", fontSize: 76, fontWeight: 900, lineHeight: 1, marginBottom: 16 }}>
              {post.slop_score}%
            </div>
            <div style={{ width: 320, height: 1, background: `${color}50`, marginBottom: 16 }} />
            <div style={{ color: "#a1a1aa", fontSize: 14, fontStyle: "italic", lineHeight: 1.5, maxWidth: 380 }}>
              &ldquo;{roast}&rdquo;
            </div>
            <div style={{ color: "#3f3f46", fontSize: 11, letterSpacing: 3, marginTop: 18 }}>
              AISLOP.COM
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
