const Database = require('better-sqlite3');
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, '..', 'db', 'leetcode_review.db');
const db = new Database(dbPath);

// 删除旧表并重新创建 problems 表
db.exec(`DROP TABLE IF EXISTS problems;`);

db.exec(`
CREATE TABLE problems (
    problem_id INTEGER PRIMARY KEY,          -- LeetCode 题目 ID
    title TEXT NOT NULL,                     -- 题目名称/链接
    difficulty TEXT CHECK(difficulty IN ('简单', '中等', '困难')), -- 难度
    last_reviewed DATETIME DEFAULT CURRENT_TIMESTAMP, -- 最后刷题时间
    stage INTEGER DEFAULT 0 CHECK(stage BETWEEN 0 AND 4), -- 复习阶段 0-4 (0:初次接触, 1:1天后, 2:7天后, 3:20天后, 4:已完成)
    next_review_date DATE,                   -- 下一次复习日期
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')), -- 状态
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_next_review_date ON problems(next_review_date);
CREATE INDEX IF NOT EXISTS idx_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_stage ON problems(stage);
`);

console.log('Database initialized successfully at:', dbPath);

// 插入一些示例数据（可选）
const insert = db.prepare(`
INSERT OR IGNORE INTO problems (problem_id, title, difficulty, stage, next_review_date, status)
VALUES (?, ?, ?, ?, ?, ?)
`);

const sampleProblems = [
    [1, '两数之和', '简单', 0, '2026-03-03', 'active'],      // 阶段0: 初次接触，今天尝试
    [2, '两数相加', '中等', 1, '2026-03-04', 'active'],      // 阶段1: 1天后复习
    [3, '无重复字符的最长子串', '中等', 2, '2026-03-10', 'active'], // 阶段2: 7天后复习
    [4, '寻找两个正序数组的中位数', '困难', 3, '2026-03-23', 'active'], // 阶段3: 20天后复习
    [5, '正则表达式匹配', '困难', 4, null, 'completed'],     // 阶段4: 已完成
];

sampleProblems.forEach(problem => {
    insert.run(...problem);
});

console.log('Sample data inserted.');

db.close();