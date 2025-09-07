import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // API logic here
    return NextResponse.json({ response: 'success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' }, 
      { status: 500 }
    );
  }
}