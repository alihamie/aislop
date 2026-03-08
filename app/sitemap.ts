import { MetadataRoute } from 'next';
import { createAdminSupabase } from '@/lib/supabaseServer';

const BASE_URL = 'https://aislophub.ai';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminSupabase();

  const { data: posts } = await admin
    .from('posts')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const postUrls: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/post/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/challenge`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...postUrls,
  ];
}
