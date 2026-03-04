import { NextResponse } from 'next/server';
import reviewService from '@/lib/reviewService';

// GET /api/today - 获取今天需要复习的题目
export async function GET() {
  try {
    const reviews = await reviewService.getTodaysReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching today\'s reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s reviews' },
      { status: 500 }
    );
  }
}