'use client';

import { useState, useEffect } from 'react';
import { Problem } from '@/lib/reviewService';
import ProblemItem from './ProblemItem';

interface ProblemListProps {
  initialProblems: Problem[];
}

export default function ProblemList({ initialProblems }: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'next_review_date' | 'stage' | 'difficulty'>('next_review_date');

  // 刷新数据
  const refreshData = async () => {
    const response = await fetch('/api/problems');
    if (response.ok) {
      const data = await response.json();
      setProblems(data);
    }
  };

  // 应用过滤和排序
  const filteredProblems = problems.filter(problem => {
    if (filter === 'active') return problem.status === 'active';
    if (filter === 'completed') return problem.status === 'completed';
    return true;
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortBy === 'next_review_date') {
      if (a.next_review_date === null) return 1;
      if (b.next_review_date === null) return -1;
      return a.next_review_date.localeCompare(b.next_review_date);
    }
    if (sortBy === 'stage') {
      return a.stage - b.stage;
    }
    if (sortBy === 'difficulty') {
      const difficultyOrder = { '简单': 1, '中等': 2, '困难': 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    return 0;
  });

  // 阶段统计
  const stageStats = {
    0: problems.filter(p => p.stage === 0).length,
    1: problems.filter(p => p.stage === 1).length,
    2: problems.filter(p => p.stage === 2).length,
    3: problems.filter(p => p.stage === 3).length,
    4: problems.filter(p => p.stage === 4).length,
  };

  const handleReviewComplete = () => {
    refreshData();
  };

  return (
    <div>
      {/* 控制栏 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700">筛选:</div>
          <div className="flex space-x-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-full ${filter === f
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700">排序:</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 text-sm border rounded-md bg-white"
          >
            <option value="next_review_date">下次复习日期</option>
            <option value="stage">复习阶段</option>
            <option value="difficulty">题目难度</option>
          </select>
          <button
            onClick={refreshData}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 阶段统计 */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {[0, 1, 2, 3, 4].map((stage) => (
          <div key={stage} className="bg-gray-50 p-3 rounded text-center">
            <div className="text-lg font-bold text-gray-800">阶段 {stage}</div>
            <div className="text-sm text-gray-600">{stageStats[stage as keyof typeof stageStats]} 题</div>
          </div>
        ))}
      </div>

      {/* 题目表格 */}
      {sortedProblems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filter === 'all' ? '还没有添加题目。' : '没有符合条件的题目。'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">题目</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">难度</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">阶段</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次复习</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProblems.map((problem) => (
                <ProblemItem
                  key={problem.problem_id}
                  problem={problem}
                  onReviewComplete={handleReviewComplete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}