'use client';

import { useState, useEffect } from 'react';
import { Problem } from '@/lib/reviewService';

interface TodayReviewsProps {
  initialReviews: Problem[];
}

export default function TodayReviews({ initialReviews }: TodayReviewsProps) {
  const [reviews, setReviews] = useState<Problem[]>(initialReviews);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshReviews = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/today');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 生成力扣题目链接
  const getLeetCodeUrl = (problem: Problem) => {
    const leetCodeDomain = 'https://leetcode.cn'; // 默认使用中文站
    // 使用题目ID进行搜索，通常能直接找到对应题目
    return `${leetCodeDomain}/problemset/all/?search=${problem.problem_id}`;
  };

  useEffect(() => {
    // 每小时自动刷新一次
    const interval = setInterval(refreshReviews, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (reviews.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <span className="mr-2">🎉</span>
              今日复习完成
            </h2>
            <p className="text-green-700 mt-1">今天没有需要复习的题目，继续保持！</p>
          </div>
          <button
            onClick={refreshReviews}
            disabled={isRefreshing}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
          >
            {isRefreshing ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-red-800 flex items-center">
            <span className="mr-2">📚</span>
            今日需要复习
          </h2>
          <p className="text-red-700">
            今天有 <span className="font-bold text-xl">{reviews.length}</span> 个题目需要复习
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshReviews}
            disabled={isRefreshing}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
          >
            {isRefreshing ? '刷新中...' : '刷新'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-red-700 border border-red-300 rounded-md hover:bg-red-50"
          >
            查看全部
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-red-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">题目</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">难度</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">当前阶段</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {reviews.map((problem) => (
              <tr key={problem.problem_id} className="hover:bg-red-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    <a
                      href={getLeetCodeUrl(problem)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      title="点击跳转到力扣题目页面"
                    >
                      {problem.problem_id}. {problem.title}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${problem.difficulty === '简单'
                      ? 'bg-green-100 text-green-800'
                      : problem.difficulty === '中等'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${problem.stage === 0
                      ? 'bg-blue-100 text-blue-800'
                      : problem.stage === 1
                        ? 'bg-green-100 text-green-800'
                        : problem.stage === 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                                    }`}>
                    阶段 {problem.stage}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      // 滚动到对应题目
                      const element = document.getElementById(`problem-${problem.problem_id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        // 高亮显示
                        element.classList.add('bg-yellow-50');
                        setTimeout(() => element.classList.remove('bg-yellow-50'), 2000);
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                  >
                    去复习
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}