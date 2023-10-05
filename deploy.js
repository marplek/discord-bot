const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'ping',
    description: 'Obtain the delay information of the bot',
  },
  {
    name: 'subscribe',
    description: 'Subscribe to weekly reminders.',
  },
  {
    name: 'unsubscribe',
    description: 'Unsubscribe from weekly reminders.',
  },
  {
    name: 'viewsubscribers',
    description: 'View the list of subscribers.',
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();