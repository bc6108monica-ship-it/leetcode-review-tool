import { NextRequest, NextResponse } from 'next/server';
import reviewService, { AddProblemRequest } from '@/lib/reviewService';

// GET /api/problems - 获取所有题目
export async function GET() {
  try {
    const problems = await reviewService.getAllProblems();
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problems' },
      { status: 500 }
    );
  }
}

// POST /api/problems - 添加新题目
export async function POST(request: NextRequest) {
  try {
    const data: AddProblemRequest = await request.json();

    // 验证数据
    if (!data.problem_id || !data.title || !data.difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['简单', '中等', '困难'].includes(data.difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be 简单, 中等, or 困难' },
        { status: 400 }
      );
    }

    const added = await reviewService.addProblem(data);

    if (added) {
      return NextResponse.json(
        { message: `题目 "${data.title}" 添加成功，今天开始第一次尝试。` },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: `题目ID ${data.problem_id} 已存在。` },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Error adding problem:', error);
    return NextResponse.json(
      { error: 'Failed to add problem' },
      { status: 500 }
    );
  }
}