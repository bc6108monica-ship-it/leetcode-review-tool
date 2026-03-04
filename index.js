#!/usr/bin/env node

const ReviewScheduler = require('./src/review');
const scheduler = new ReviewScheduler();

function showHelp() {
    console.log(`
LeetCode 艾宾浩斯复习提醒工具

用法:
  node index.js <命令> [参数]

命令:
  add <题目ID> "<题目名称>" <难度>  添加新题目（难度：简单/中等/困难）
  review <题目ID> <成功与否>        记录复习结果（成功: 1，失败: 0）
  today                            显示今天需要复习的题目
  list                             显示所有题目
  help                             显示此帮助信息

示例:
  node index.js add 1 "两数之和" 简单
  node index.js review 1 1
  node index.js today
`);
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === 'help') {
        showHelp();
        return;
    }

    try {
        switch (command) {
            case 'add':
                if (args.length < 4) {
                    console.error('参数不足。用法: add <题目ID> "<题目名称>" <难度>');
                    process.exit(1);
                }
                const problemId = parseInt(args[1]);
                const title = args[2];
                const difficulty = args[3];
                if (!['简单', '中等', '困难'].includes(difficulty)) {
                    console.error('难度必须是：简单、中等、困难');
                    process.exit(1);
                }
                const added = scheduler.addProblem(problemId, title, difficulty);
                if (added) {
                    console.log(`题目 "${title}" 添加成功，今天开始第一次尝试。`);
                } else {
                    console.log(`题目ID ${problemId} 已存在。`);
                }
                break;

            case 'review':
                if (args.length < 3) {
                    console.error('参数不足。用法: review <题目ID> <成功与否>');
                    process.exit(1);
                }
                const reviewProblemId = parseInt(args[1]);
                const success = args[2] === '1';
                const result = scheduler.recordReview(reviewProblemId, success);
                console.log(`复习记录成功。新阶段: ${result.newStage}, 下次复习日期: ${result.nextReviewDate || '无（已掌握）'}`);
                break;

            case 'today':
                const reviews = scheduler.getTodaysReviews();
                if (reviews.length === 0) {
                    console.log('今天没有需要复习的题目。');
                } else {
                    console.log(`今天有 ${reviews.length} 个题目需要复习:`);
                    reviews.forEach(p => {
                        console.log(`  ${p.problem_id}. ${p.title} (${p.difficulty}) - 阶段 ${p.stage}`);
                    });
                }
                break;

            case 'list':
                const problems = scheduler.getAllProblems();
                if (problems.length === 0) {
                    console.log('还没有添加任何题目。');
                } else {
                    console.log(`共 ${problems.length} 个题目:`);
                    problems.forEach(p => {
                        const status = p.status === 'completed' ? '✅' : '🔄';
                        console.log(`  ${status} ${p.problem_id}. ${p.title} (${p.difficulty}) - 阶段 ${p.stage} - 下次复习: ${p.next_review_date || '已掌握'}`);
                    });
                }
                break;

            default:
                console.error(`未知命令: ${command}`);
                showHelp();
                process.exit(1);
        }
    } catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
    } finally {
        scheduler.close();
    }
}

if (require.main === module) {
    main();
}