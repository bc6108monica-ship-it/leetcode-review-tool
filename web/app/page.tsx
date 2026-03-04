import ProblemList from '@/components/ProblemList';
import AddProblemForm from '@/components/AddProblemForm';
import TodayReviews from '@/components/TodayReviews';
import NotificationManager from '@/components/NotificationManager';
import { getProblems, getTodayReviews } from '@/lib/data';

export default async function Home() {
  // 服务器端获取数据
  const [problems, todayReviews] = await Promise.all([
    getProblems(),
    getTodayReviews(),
  ]);

  return (
    <div className="space-y-8">
      {/* 今日复习提醒 */}
      <TodayReviews initialReviews={todayReviews} />

      {/* 添加新题目 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">添加新题目</h2>
        <AddProblemForm />
      </div>

      {/* 题目列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">题目列表</h2>
          <div className="text-sm text-gray-500">
            共 {problems.length} 个题目，其中{' '}
            {problems.filter(p => p.status === 'completed').length} 个已掌握
          </div>
        </div>
        <ProblemList initialProblems={problems} />
      </div>

      {/* 阶段说明 */}
      <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-blue-800 mb-3">复习阶段说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-blue-600">阶段 0</div>
            <div className="text-sm text-gray-600 mt-1">初次接触</div>
            <div className="text-xs text-gray-500">今天开始尝试</div>
          </div>
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-green-600">阶段 1</div>
            <div className="text-sm text-gray-600 mt-1">1天后复习</div>
            <div className="text-xs text-gray-500">成功→阶段2，失败→保持</div>
          </div>
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-yellow-600">阶段 2</div>
            <div className="text-sm text-gray-600 mt-1">7天后复习</div>
            <div className="text-xs text-gray-500">成功→阶段3，失败→阶段1</div>
          </div>
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-orange-600">阶段 3</div>
            <div className="text-sm text-gray-600 mt-1">20天后复习</div>
            <div className="text-xs text-gray-500">成功→完成，失败→阶段2</div>
          </div>
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-purple-600">阶段 4</div>
            <div className="text-sm text-gray-600 mt-1">已掌握</div>
            <div className="text-xs text-gray-500">无需再复习</div>
          </div>
        </div>
      </div>
      <NotificationManager />
    </div>
  );
}