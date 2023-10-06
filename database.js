const sqlite3 = require('better-sqlite3');
const db = sqlite3('/usr/src/app/data/subscriptions.db');

// 創建表
db.prepare(`
    CREATE TABLE IF NOT EXISTS reminder_channel (
        channelId TEXT PRIMARY KEY
    )
`).run();
// 創建一個表格來儲存訂閱的用戶ID
db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (
    userId TEXT PRIMARY KEY,
    channelId TEXT
);`).run();

module.exports = db;