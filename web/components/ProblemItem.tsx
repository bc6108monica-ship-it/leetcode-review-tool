'use client';

import { useState, useEffect } from 'react';
import { Problem } from '@/lib/reviewService';

interface ProblemItemProps {
  problem: Problem;
  onReviewComplete: () => void;
}

export default function ProblemItem({ problem, onReviewComplete }: ProblemItemProps) {
  // 简单的日期字符串，不依赖当前日期（用于初始渲染）
  const getSimpleDateString = (dateStr: string | null) => {
    if (!dateStr) return '已掌握';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayDate, setDisplayDate] = useState<string>(() => problem ? getSimpleDateString(problem.next_review_date) : '');
  const [needsReview, setNeedsReview] = useState(false);

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

  const getStageDescription = (stage: number) => {
    switch (stage) {
      case 0: return '初次接触';
      case 1: return '1天后复习';
      case 2: return '7天后复习';
      case 3: return '20天后复习';
      case 4: return '已掌握';
      default: return '';
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

    // 只在客户端计算相对日期
    if (typeof window !== 'undefined') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return '明天';
      }
    }

    // 服务端或非今天/明天的日期：返回标准日期格式
    return date.toLocaleDateString('zh-CN');
  };

  useEffect(() => {
    // 客户端渲染后，更新为相对日期（今天/明天）
    setDisplayDate(formatDate(problem.next_review_date));
    // 检查是否需要复习
    if (problem.next_review_date && problem.status === 'active') {
      const reviewDate = new Date(problem.next_review_date);
      const now = new Date();
      setNeedsReview(reviewDate <= now);
    } else {
      setNeedsReview(false);
    }
  }, [problem.next_review_date, problem.status]);

  // 中文题目名到 LeetCode slug 的映射
  const getLeetCodeSlug = (title: string): string => {
    const slugMap: Record<string, string> = {
      '两数之和': 'two-sum',
      '两数相加': 'add-two-numbers',
      '无重复字符的最长子串': 'longest-substring-without-repeating-characters',
      '寻找两个正序数组的中位数': 'median-of-two-sorted-arrays',
      '正则表达式匹配': 'regular-expression-matching',
      '反转链表': 'reverse-linked-list',
      '有效的括号': 'valid-parentheses',
      '合并两个有序链表': 'merge-two-sorted-lists',
      '二叉树的中序遍历': 'binary-tree-inorder-traversal',
      '爬楼梯': 'climbing-stairs',
      '买卖股票的最佳时机': 'best-time-to-buy-and-sell-stock',
      '最大子序和': 'maximum-subarray',
      '打家劫舍': 'house-robber',
      '乘积最大子数组': 'maximum-product-subarray',
      '最长递增子序列': 'longest-increasing-subsequence',
      '三数之和': '3sum',
      '盛最多水的容器': 'container-with-most-water',
      '电话号码的字母组合': 'letter-combinations-of-a-phone-number',
      '括号生成': 'generate-parentheses',
      '合并K个升序链表': 'merge-k-sorted-lists',
      '下一个排列': 'next-permutation',
      '搜索旋转排序数组': 'search-in-rotated-sorted-array',
      '在排序数组中查找元素的第一个和最后一个位置': 'find-first-and-last-position-of-element-in-sorted-array',
      '组合总和': 'combination-sum',
      '全排列': 'permutations',
      // 可以继续添加更多映射
    };

    // 如果映射中存在，直接返回
    if (slugMap[title]) {
      return slugMap[title];
    }

    // 否则生成一个简单的 slug（移除标点，用横杠连接小写字母）
    // 这里只是一个简单示例，建议逐步完善映射表
    const simpleSlug = title
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ') // 非中文、字母、数字替换为空格
      .replace(/\s+/g, '-') // 空格转横杠
      .toLowerCase();

    return simpleSlug || 'problem';
  };

  // 生成力扣题目链接
  const getLeetCodeUrl = (problem: Problem) => {
    const leetCodeDomain = 'https://leetcode.cn'; // 默认使用中文站
    const slug = getLeetCodeSlug(problem.title);
    return `${leetCodeDomain}/problems/${slug}/`;
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
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(problem.stage)}`}
          title={getStageDescription(problem.stage)}
        >
          阶段 {problem.stage}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {displayDate}
        </div>
        {needsReview && (
          <div className="text-xs text-red-600 font-medium">需要复习!</div>
        )}
        {problem.status === 'active' && problem.stage >= 1 && problem.stage <= 3 && (
          <div className="text-xs text-gray-500 mt-1">{getStageDescription(problem.stage)}</div>
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