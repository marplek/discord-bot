const { Client, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');
const db = require('./database');

require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

schedule.scheduleJob('0 12 * * 5', () => {
    const getSubscribers = db.prepare('SELECT userId FROM subscribers').all();
    for (const subscriber of getSubscribers) {
        const user = client.users.cache.get(subscriber.userId);
        if (user) user.send('這是你的每週五提醒!');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ping') {
        // 機器人延遲獲取
        const msg = await interaction.reply({
            content: "正在計算延遲......",
            fetchReply: true
        });
        const ping = msg.createdTimestamp - interaction.createdTimestamp;
        // 告知用戶延遲
        interaction.editReply(`機器人延遲：${ping} ms\nAPI延遲：${client.ws.ping} ms`)
        // \n 是指換行
    }

    if (interaction.commandName === 'subscribe') {
        db.prepare('INSERT OR IGNORE INTO subscribers (userId) VALUES (?)').run(interaction.user.id);
        await interaction.reply('您已訂閱每週五的提醒!');
    } else if (interaction.commandName === 'unsubscribe') {
        db.prepare('DELETE FROM subscribers WHERE userId = ?').run(interaction.user.id);
        await interaction.reply('您已取消訂閱每週五的提醒!');
    }
    if (interaction.commandName === 'viewsubscribers') {
        const getSubscribers = db.prepare('SELECT userId FROM subscribers').all();
        let messageContent = "訂閱者列表：\n";

        for (const subscriber of getSubscribers) {
            messageContent += `<@${subscriber.userId}>\n`;  // 使用 <@userID> 可以在Discord中提及用戶
        }

        // 如果沒有訂閱者
        if (getSubscribers.length === 0) {
            messageContent = "目前沒有訂閱者。";
        }

        await interaction.reply(messageContent);
    }
});

client.login(process.env.TOKEN);