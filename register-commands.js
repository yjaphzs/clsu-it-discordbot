// This script registers the /promote slash command for your Discord bot.
// Run this file manually whenever you update your slash commands.

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Define the slash command(s) to register
const commands = [
  new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote users by year, user, or role')
    .addStringOption(option =>
      option
        .setName('target')
        .setDescription('Specify "all", @user, or a role name')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('listyearlevels')
    .setDescription('List all members per year level')
    .toJSON()
];

// Set up REST client with your bot token
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// Register the commands for your guild (server)
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID, // Your bot's application/client ID
        process.env.SERVER_ID  // Your Discord server/guild ID
      ),
      { body: commands }
    );
    console.log('Slash command registered successfully!');
  } catch (error) {
    console.error('Error registering slash command:', error);
  }
})();