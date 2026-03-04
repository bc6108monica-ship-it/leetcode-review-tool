const Database = require('better-sqlite3');
const path = require('path');

class ReviewScheduler {
    constructor(dbPath = null) {
        if (!dbPath) {
            dbPath = path.join(__dirname, '..', 'db', 'leetcode_review.db');
        }
        this.db = new Database(dbPath);
    }

    // 根据当前阶段和最后复习日期计算下一次复习日期
    calculateNextReviewDate(stage, lastReviewedDate = new Date()) {
        const days = this.getIntervalDays(stage);
        if (days === null) {
            return null; // 已掌握，无需再复习
        }
        const nextDate = new Date(lastReviewedDate);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate.toISOString().split('T')[0]; // 返回 YYYY-MM-DD 格式
    }

    // 获取当前阶段对应的复习间隔天数
    getIntervalDays(stage) {
        switch (stage) {
            case 0: return 0;   // 初次接触，立即尝试
            case 1: return 1;   // 1天后第一次复习
            case 2: return 7;   // 7天后第二次复习
            case 3: return 20;  // 20天后第三次复习
            case 4: return null; // 已掌握，无需再复习
            default: return null;
        }
    }

    // 添加新题目
    addProblem(problemId, title, difficulty) {
        const nextReviewDate = this.calculateNextReviewDate(0); // 阶段0，立即尝试
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO problems (problem_id, title, difficulty, stage, next_review_date, status)
            VALUES (?, ?, ?, 0, ?, 'active')
        `);
        const result = stmt.run(problemId, title, difficulty, nextReviewDate);
        return result.changes > 0;
    }

    // 记录复习结果（成功或失败）
    recordReview(problemId, success) {
        // 获取当前题目状态
        const problem = this.db.prepare('SELECT stage, last_reviewed FROM problems WHERE problem_id = ?').get(problemId);
        if (!problem) {
            throw new Error(`Problem ${problemId} not found`);
        }

        let newStage = problem.stage;

        // 根据当前阶段和成功失败决定新阶段
        switch (problem.stage) {
            case 0: // 初次尝试：无论成功失败都进入阶段1
                newStage = 1;
                break;
            case 1: // 阶段1：成功→阶段2，失败→保持阶段1
                newStage = success ? 2 : 1;
                break;
            case 2: // 阶段2：成功→阶段3，失败→退回阶段1
                newStage = success ? 3 : 1;
                break;
            case 3: // 阶段3：成功→阶段4（完成），失败→退回阶段2
                newStage = success ? 4 : 2;
                break;
            case 4: // 已完成：保持不变
                newStage = 4;
                break;
            default:
                throw new Error(`Invalid stage: ${problem.stage}`);
        }

        const now = new Date().toISOString();
        const nextReviewDate = this.calculateNextReviewDate(newStage, now);

        // 更新题目
        const stmt = this.db.prepare(`
            UPDATE problems
            SET stage = ?, last_reviewed = ?, next_review_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE problem_id = ?
        `);
        stmt.run(newStage, now, nextReviewDate, problemId);

        // 如果阶段为4，则标记为已完成
        if (newStage === 4) {
            this.db.prepare(`UPDATE problems SET status = 'completed' WHERE problem_id = ?`).run(problemId);
        }

        return { newStage, nextReviewDate };
    }

    // 获取今天需要复习的题目
    getTodaysReviews() {
        const today = new Date().toISOString().split('T')[0];
        const stmt = this.db.prepare(`
            SELECT problem_id, title, difficulty, stage
            FROM problems
            WHERE next_review_date <= ? AND status = 'active'
            ORDER BY next_review_date ASC
        `);
        return stmt.all(today);
    }

    // 获取所有题目
    getAllProblems() {
        const stmt = this.db.prepare('SELECT * FROM problems ORDER BY next_review_date ASC');
        return stmt.all();
    }

    close() {
        this.db.close();
    }
}

module.exports = ReviewScheduler;