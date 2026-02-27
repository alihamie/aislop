import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing post id.' }, { status: 400 });

    const { data, error } = await supabase.rpc('increment_upvotes', { post_id: id });

    if (error) {
      // Fallback: manual increment if RPC doesn't exist
      const { data: post } = await supabase.from('posts').select('human_upvotes').eq('id', id).single();
      const { error: updateError } = await supabase
        .from('posts')
        .update({ human_upvotes: (post?.human_upvotes ?? 0) + 1 })
        .eq('id', id);
      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Upvote error:', err);
    return NextResponse.json({ error: 'Failed to upvote.' }, { status: 500 });
  }
}
