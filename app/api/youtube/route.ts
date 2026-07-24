import { NextResponse } from 'next/server';
import { getChannelVideos } from '@/lib/youtube';

export async function GET() {
  const videos = await getChannelVideos(6);
  return NextResponse.json({ videos });
}