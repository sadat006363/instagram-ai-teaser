import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Instagram API is working' });
}

export async function POST() {
  return NextResponse.json({ message: 'POST method not implemented yet' }, { status: 405 });
}// API route will be added here