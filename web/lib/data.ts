import reviewService, { Problem } from './reviewService';

// 服务器端获取所有题目
export async function getProblems(): Promise<Problem[]> {
  return reviewService.getAllProblems();
}

// 服务器端获取今天需要复习的题目
export async function getTodayReviews(): Promise<Problem[]> {
  return reviewService.getTodaysReviews();
}

// 服务器端获取单个题目
export async function getProblem(problemId: number): Promise<Problem | null> {
  return reviewService.getProblem(problemId);
}