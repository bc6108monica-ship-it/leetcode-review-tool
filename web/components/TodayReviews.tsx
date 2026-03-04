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
            className="px-4 py-4 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
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
            className="px-4 py-4 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
          >
            {isRefreshing ? '刷新中...' : '刷新'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-4 bg-white text-red-700 border border-red-300 rounded-md hover:bg-red-50"
          >
            查看全部
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-red-200">
          <thead>
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">题目</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">难度</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">当前阶段</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {reviews.map((problem) => (
              <tr key={problem.problem_id} className="hover:bg-red-100">
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">
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
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${problem.difficulty === '简单'
                      ? 'bg-green-100 text-green-800'
                      : problem.difficulty === '中等'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${problem.stage === 0
                        ? 'bg-blue-100 text-blue-800'
                        : problem.stage === 1
                          ? 'bg-green-100 text-green-800'
                          : problem.stage === 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    title={problem.stage === 0 ? '初次接触' :
                           problem.stage === 1 ? '1天后复习' :
                           problem.stage === 2 ? '7天后复习' :
                           '20天后复习'}
                  >
                    阶段 {problem.stage}
                  </span>
                </td>
                <td className="px-4 py-4">
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