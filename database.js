const sqlite3 = require('better-sqlite3');
const db = sqlite3('/usr/src/app/data/subscriptions.db');

// 創建一個表格來儲存訂閱的用戶ID
db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (
    userId TEXT PRIMARY KEY
)`).run();

module.exports = db;