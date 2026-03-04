import { NextRequest, NextResponse } from 'next/server';
import reviewService from '@/lib/reviewService';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/problems/[id]/review - 记录复习结果
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const problemId = parseInt(params.id, 10);

    if (isNaN(problemId)) {
      return NextResponse.json(
        { error: 'Invalid problem ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { success } = data;

    if (typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid success field (must be boolean)' },
        { status: 400 }
      );
    }

    const result = await reviewService.recordReview(problemId, success);

    return NextResponse.json({
      message: '复习记录成功',
      ...result
    });
  } catch (error) {
    console.error('Error recording review:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: '题目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}