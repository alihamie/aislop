import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabaseServer";
import type { Post } from "@/lib/types";

export const runtime = "edge";

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

// Generate perforated stamp edge using repeating circles
function PerforatedBorder() {
  const size = 600;
  const holeSize = 14;
  const gap = 20;
  const dots = [];

  // Top & bottom rows
  for (let x = 10; x < size - 10; x += gap) {
    dots.push(
      <div key={`t${x}`} style={{ position: "absolute", top: 8, left: x, width: holeSize, height: holeSize, borderRadius: "50%", background: "#09090b" }} />,
      <div key={`b${x}`} style={{ position: "absolute", bottom: 8, left: x, width: holeSize, height: holeSize, borderRadius: "50%", background: "#09090b" }} />
    );
  }
  // Left & right columns
  for (let y = 30; y < size - 30; y += gap) {
    dots.push(
      <div key={`l${y}`} style={{ position: "absolute", top: y, left: 8, width: holeSize, height: holeSize, borderRadius: "50%", background: "#09090b" }} />,
      <div key={`r${y}`} style={{ position: "absolute", top: y, right: 8, width: holeSize, height: holeSize, borderRadius: "50%", background: "#09090b" }} />
    );
  }
  return <>{dots}</>;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const admin = createAdminSupabase();
  const { data } = await admin
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  const post = data as Post | null;
  if (!post) return new Response("Not found", { status: 404 });

  const color = getScoreColor(post.slop_score);
  const tier = getTierLabel(post.slop_score);
  const emoji = getTierEmoji(post.slop_score);
  const roast = post.roast.length > 110 ? post.roast.slice(0, 109) + "…" : post.roast;

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
        {/* Postage stamp outer */}
        <div
          style={{
            position: "relative",
            width: 520,
            height: 520,
            background: "#18181b",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${color}`,
            boxShadow: `0 0 30px ${color}50, inset 0 0 20px ${color}10`,
          }}
        >
          {/* Perforated edge holes */}
          <PerforatedBorder />

          {/* Inner content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 40px",
              textAlign: "center",
              gap: 0,
            }}
          >
            {/* AI SLOP JUDGE label */}
            <div style={{ color: "#52525b", fontSize: 13, fontWeight: 700, letterSpacing: 5, marginBottom: 12 }}>
              AI SLOP JUDGE
            </div>

            {/* Emoji */}
            <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>

            {/* Tier */}
            <div style={{ color, fontSize: 26, fontWeight: 900, letterSpacing: 2, marginBottom: 4 }}>
              {tier}
            </div>

            {/* Score */}
            <div style={{ color: "#ffffff", fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 16 }}>
              {post.slop_score}%
            </div>

            {/* Divider */}
            <div style={{ width: 300, height: 1, background: `${color}40`, marginBottom: 16 }} />

            {/* Roast */}
            <div style={{ color: "#a1a1aa", fontSize: 15, fontStyle: "italic", lineHeight: 1.5, maxWidth: 380 }}>
              &ldquo;{roast}&rdquo;
            </div>

            {/* Site */}
            <div style={{ color: "#3f3f46", fontSize: 12, letterSpacing: 3, marginTop: 16 }}>
              AISLOP.COM
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
