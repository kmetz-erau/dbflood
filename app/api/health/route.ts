import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ status: 'ok', service: 'daytona-flood-watch', time: new Date().toISOString() }); }
