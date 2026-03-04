'use client';

import { useEffect, useState } from 'react';

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    // 检查通知权限
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setIsEnabled(true);
      }
    }

    // 检查今日复习并发送通知
    const checkAndNotify = async () => {
      try {
        const response = await fetch('/api/today');
        if (response.ok) {
          const reviews = await response.json();
          if (reviews.length > 0 && permission === 'granted') {
            // 发送通知
            const notification = new Notification('LeetCode 复习提醒', {
              body: `今天有 ${reviews.length} 个题目需要复习。快去看看吧！`,
              icon: '/favicon.ico',
              tag: 'leetcode-review',
            });

            // 点击通知打开页面
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        }
      } catch (error) {
        console.error('Error checking reviews for notification:', error);
      }
    };

    // 页面加载时检查一次
    checkAndNotify();

    // 每小时检查一次
    const interval = setInterval(checkAndNotify, 3600000);
    return () => clearInterval(interval);
  }, [permission]);

  const requestPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('您的浏览器不支持通知功能。');
      return;
    }

    Notification.requestPermission().then((result) => {
      setPermission(result);
      if (result === 'granted') {
        setIsEnabled(true);
        // 发送测试通知
        new Notification('通知已启用', {
          body: 'LeetCode 复习提醒通知已成功启用！',
          icon: '/favicon.ico',
        });
      }
    });
  };

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">复习提醒</span>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-10 h-5 rounded-full relative ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {isEnabled
            ? '通知已启用，每小时检查一次复习提醒。'
            : '启用通知以接收每日复习提醒。'}
        </p>
        {permission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            启用浏览器通知
          </button>
        )}
      </div>
    </div>
  );
}