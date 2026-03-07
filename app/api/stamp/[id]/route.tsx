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
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const color = getScoreColor(post.slop_score);
  const tier = getTierLabel(post.slop_score);
  const emoji = getTierEmoji(post.slop_score);
  const roast = post.roast.length > 120 ? post.roast.slice(0, 119) + "…" : post.roast;

  return new ImageResponse(
    (
      <div
        style={{
          width: 600,
          height: 600,
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Stamp circle */}
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: `12px solid ${color}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            transform: "rotate(-8deg)",
            boxShadow: `0 0 40px ${color}40`,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 4 }}>{emoji}</div>
          <div
            style={{
              color,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 3,
              textAlign: "center",
              lineHeight: 1.2,
              padding: "0 20px",
            }}
          >
            {tier}
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {post.slop_score}%
          </div>
          <div
            style={{
              color: "#52525b",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 4,
              marginTop: 8,
            }}
          >
            AI SLOP JUDGE
          </div>
        </div>

        {/* Roast */}
        <div
          style={{
            color: "#a1a1aa",
            fontSize: 16,
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 480,
            marginBottom: 20,
          }}
        >
          &ldquo;{roast}&rdquo;
        </div>

        {/* Site */}
        <div style={{ color: "#3f3f46", fontSize: 13, letterSpacing: 2 }}>
          AISLOP.COM
        </div>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
