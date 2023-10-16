const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./database');
const cron = require('node-cron');

require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// 這將在每週五的UTC+8的20:00運行
cron.schedule('0 20 * * 5', () => {
    try {
        const getSubscribers = db.prepare('SELECT userId FROM subscribers').all();
        for (const subscriber of getSubscribers) {
            const user = client.users.cache.get(subscriber.userId);
            if (user) user.send('CY Alert!');
        }
    }
    catch (error) {
        console.error('Database error:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Taipei"  // UTC+8
});

cron.schedule('0 23 * * 5', () => {
    try {
        const channelInfo = db.prepare('SELECT channelId FROM reminder_channel').get();
        if (channelInfo && channelInfo.channelId) {
            const channel = client.channels.cache.get(channelInfo.channelId);
            const subscribers = db.prepare('SELECT userId FROM subscribers').all();
            const mentions = subscribers.map(s => `<@${s.userId}>`).join(' ');
            channel.send(`${mentions}, 記得發佈文章!`);
        }
    }
    catch (error) {
        console.error('Database error:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Taipei"  // UTC+8
});


client.on('interactionCreate', async interaction => {
    try {
        const currentChannelInfo = db.prepare('SELECT channelId FROM reminder_channel').get();
        const currentChannelId = currentChannelInfo ? currentChannelInfo.channelId : null;

        if (!interaction.isChatInputCommand()) return;

        if (!currentChannelId && interaction.commandName !== 'setchannel') {
            await interaction.reply('您必須首先設定提醒頻道，使用 `setchannel` 指令！');
            return;
        }

        if (interaction.commandName === 'ping') {
            const msg = await interaction.reply({
                content: "正在計算延遲......",
                fetchReply: true
            });
            const ping = msg.createdTimestamp - interaction.createdTimestamp;
            interaction.editReply(`機器人延遲：${ping} ms\nAPI延遲：${client.ws.ping} ms`);
            return;
        }

        if (interaction.commandName === 'setchannel') {
            const channel = interaction.options.getChannel('channel');
            if (channel) {
                db.prepare('INSERT OR REPLACE INTO reminder_channel (channelId) VALUES (?)').run(channel.id);
                await interaction.reply('Reminder channel set successfully!');
            } else {
                await interaction.reply('Error setting the reminder channel.');
            }
        }

        if (interaction.commandName === 'subscribe') {
            db.prepare('INSERT OR IGNORE INTO subscribers (userId, channelId) VALUES (?, ?)').run(interaction.user.id, currentChannelId);
            await interaction.reply('您已訂閱每週五的提醒!');
        } else if (interaction.commandName === 'unsubscribe') {
            db.prepare('DELETE FROM subscribers WHERE userId = ? AND channelId = ?').run(interaction.user.id, currentChannelId);
            await interaction.reply('您已取消訂閱每週五的提醒!');
        }

        if (interaction.commandName === 'viewsubscribers') {
            const getSubscribers = db.prepare('SELECT userId FROM subscribers WHERE channelId = ?').all(currentChannelId);
            let messageContent = "訂閱者列表：\n";

            for (const subscriber of getSubscribers) {
                messageContent += `<@${subscriber.userId}>\n`;
            }

            if (getSubscribers.length === 0) {
                messageContent = "目前沒有訂閱者。";
            }

            await interaction.reply(messageContent);
        }
        if (interaction.commandName === 'unsetchannel') {
            try {
                // 取得當前設置的頻道
                const currentChannelInfo = db.prepare('SELECT channelId FROM reminder_channel').get();
                const currentChannelId = currentChannelInfo ? currentChannelInfo.channelId : null;

                if (!currentChannelId) {
                    await interaction.reply('目前沒有設置提醒頻道，因此不能執行解除操作。');
                    return;
                }

                // 刪除該頻道的所有訂閱者
                db.prepare('DELETE FROM subscribers WHERE channelId = ?').run(currentChannelId);
                // 刪除提醒頻道
                db.prepare('DELETE FROM reminder_channel WHERE channelId = ?').run(currentChannelId);

                await interaction.reply('成功解除提醒頻道和其相關的訂閱者！');
            } catch (error) {
                console.error('Error executing unsetchannel:', error.message);
                await interaction.reply({ content: '在解除頻道時發生了錯誤。', ephemeral: true });
            }
        }
    } catch (error) {
        console.error('Error handling interaction:', error.message);
        await interaction.reply({ content: '發生了一個錯誤，請稍後再試。', ephemeral: true });
    }
});

client.login(process.env.TOKEN);