import { NextResponse } from 'next/server';
import { getDashboard } from '@/lib/feeds';
export const revalidate = 180;
export async function GET() { return NextResponse.json(await getDashboard(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }); }
