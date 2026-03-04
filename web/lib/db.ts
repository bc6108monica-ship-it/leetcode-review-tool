import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'db', 'leetcode_review.db');

class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;

  private constructor() {
    this.db = new Database(dbPath);
    this.initialize();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initialize() {
    // 确保表存在（可选，已在初始化脚本中创建）
    // 可以在这里添加数据库迁移逻辑
  }

  getConnection(): Database.Database {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

export default DatabaseService;