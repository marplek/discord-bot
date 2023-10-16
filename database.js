const sqlite3 = require('better-sqlite3');
const db = sqlite3('/usr/src/app/data/subscriptions.db');

// 創建儲存訂閱頻道的表格
db.prepare(`
    CREATE TABLE IF NOT EXISTS reminder_channel (
        channelId TEXT PRIMARY KEY
    )
`).run();
// 創建一個儲存訂閱的用戶ID的表格
db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (
    userId TEXT PRIMARY KEY,
    channelId TEXT
);`).run();

module.exports = db;