'use client';

import { useState } from 'react';
import { Problem } from '@/lib/reviewService';

interface ProblemItemProps {
  problem: Problem;
  onReviewComplete: () => void;
}

export default function ProblemItem({ problem, onReviewComplete }: ProblemItemProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 0: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return 'bg-green-100 text-green-800';
      case '中等': return 'bg-yellow-100 text-yellow-800';
      case '困难': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReview = async (success: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/problems/${problem.problem_id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success }),
      });

      if (response.ok) {
        onReviewComplete();
        setIsReviewing(false);
      } else {
        const error = await response.json();
        alert(`记录复习结果失败: ${error.error}`);
      }
    } catch (error) {
      console.error('Error recording review:', error);
      alert('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '已掌握';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 生成力扣题目链接
  const getLeetCodeUrl = (problem: Problem) => {
    const leetCodeDomain = 'https://leetcode.cn'; // 默认使用中文站
    // 使用题目ID进行搜索，通常能直接找到对应题目
    return `${leetCodeDomain}/problemset/all/?search=${problem.problem_id}`;
  };

  return (
    <tr id={`problem-${problem.problem_id}`} className="hover:bg-gray-50">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
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
            <div className="text-xs text-gray-500">
              最后复习: {new Date(problem.last_reviewed).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(problem.stage)}`}>
            阶段 {problem.stage}
          </span>
          <div className="ml-3 text-xs text-gray-500">
            {problem.stage === 0 && '初次接触'}
            {problem.stage === 1 && '1天后复习'}
            {problem.stage === 2 && '7天后复习'}
            {problem.stage === 3 && '20天后复习'}
            {problem.stage === 4 && '已掌握'}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {formatDate(problem.next_review_date)}
        </div>
        {problem.next_review_date && new Date(problem.next_review_date) <= new Date() && problem.status === 'active' && (
          <div className="text-xs text-red-600 font-medium">需要复习!</div>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${problem.status === 'completed'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'
          }`}>
          {problem.status === 'completed' ? '✅ 已掌握' : '🔄 进行中'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        {problem.status === 'active' && (
          <div className="flex space-x-2">
            {!isReviewing ? (
              <button
                onClick={() => setIsReviewing(true)}
                disabled={isSubmitting}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                记录复习
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleReview(true)}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  ✓ 成功
                </button>
                <button
                  onClick={() => handleReview(false)}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  ✗ 失败
                </button>
                <button
                  onClick={() => setIsReviewing(false)}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  取消
                </button>
              </>
            )}
          </div>
        )}
        {problem.status === 'completed' && (
          <span className="text-gray-400">已完成</span>
        )}
      </td>
    </tr>
  );
}