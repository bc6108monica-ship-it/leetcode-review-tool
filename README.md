# LeetCode 艾宾浩斯遗忘曲线复习提醒工具

基于艾宾浩斯遗忘曲线的 LeetCode 刷题复习提醒工具，使用 Node.js 和 SQLite 数据库。

## 功能

- 添加 LeetCode 题目，自动安排复习计划
- 根据艾宾浩斯遗忘曲线计算复习间隔：
  - 阶段 0（新加入）：1 天后第一次复习
  - 阶段 1（已复习一次）：7 天后第二次复习
  - 阶段 2（已复习二次）：20 天后第三次复习
  - 阶段 3（已掌握）：无需再复习
- 记录复习结果（成功/失败），自动调整阶段
- 查看今日需要复习的题目
- 查看所有题目状态

## 技术栈

- Node.js
- SQLite (better-sqlite3)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npm run init-db
```

这会创建数据库文件 `db/leetcode_review.db` 并插入示例数据。

### 3. 使用命令行工具

```bash
# 显示帮助
npm start
# 或
node index.js help

# 添加新题目
node index.js add 1 "两数之和" 简单

# 记录复习结果（成功）
node index.js review 1 1

# 记录复习结果（失败）
node index.js review 1 0

# 查看今天需要复习的题目
node index.js today

# 查看所有题目
node index.js list
```

## 数据库结构

### problems 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| problem_id | INTEGER | LeetCode 题目 ID（主键） |
| title | TEXT | 题目名称/链接 |
| difficulty | TEXT | 难度（简单/中等/困难） |
| last_reviewed | DATETIME | 最后刷题时间 |
| stage | INTEGER | 复习阶段（0-3） |
| next_review_date | DATE | 下一次复习日期 |
| status | TEXT | 状态（active/completed） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 核心算法

### 复习间隔计算

```javascript
function getIntervalDays(stage) {
    switch (stage) {
        case 0: return 1;   // 新加入，1天后第一次复习
        case 1: return 7;   // 第一次复习后，7天后第二次复习
        case 2: return 20;  // 第二次复习后，20天后第三次复习
        case 3: return null; // 已掌握，无需再复习
    }
}
```

### 阶段更新规则

- 复习成功：阶段 +1（不超过 3）
- 复习失败：阶段 -1（不低于 0）
- 阶段达到 3 时，题目标记为 "已掌握" (status: completed)

## 项目结构

```
.
├── index.js              # 命令行入口
├── package.json
├── README.md
├── db/                   # 数据库文件目录
├── scripts/
│   └── init_db.js       # 数据库初始化脚本
├── src/
│   └── review.js        # 核心复习调度逻辑
└── node_modules/
```

## 下一步计划

1. Web 界面（可选）
2. 邮件/通知提醒
3. 导入 LeetCode 提交记录
4. 统计图表展示复习进度

## 许可证

ISC