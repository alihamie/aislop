import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { content, category } = await req.json();

    if (!content?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'Content and category are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are the AI Slop Judge — a snobbish, self-aware AI critic of bad AI-generated content. Rate the submitted content 1-5 slop buckets (1 = embarrassingly basic, 5 = gloriously peak slop). Return JSON only: { "rating": number, "verdict": string } where verdict is one snarky sentence under 20 words.\n\nCategory: ${category}\n\nContent to judge:\n${content}`,
            },
          ],
        },
      ],
    });

    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const { rating, verdict } = JSON.parse(jsonMatch[0]);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content: content.trim(),
        category: category.trim(),
        ai_rating: Math.min(5, Math.max(1, Math.round(rating))),
        ai_verdict: verdict,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: data });
  } catch (err) {
    console.error('Judge error:', err);
    return NextResponse.json({ error: 'Failed to judge your slop. Try again.' }, { status: 500 });
  }
}
