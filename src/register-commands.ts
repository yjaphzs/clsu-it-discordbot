/**
 *
 * This script registers the /promote slash command for your Discord bot.
 * Run this file manually whenever you update your slash commands.
 *
 */

import { REST, Routes, SlashCommandBuilder } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

// Define the slash command(s) to register
const commands = [
    new SlashCommandBuilder()
        .setName("promote")
        .setDescription("Promote users by year, user, or role")
        .addStringOption((option) =>
            option
                .setName("target")
                .setDescription('Specify "all", @user, or a role name')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName("year-level-member-stats")
        .setDescription("List all members per year level")
        .toJSON(),
];

// Set up REST client with your bot token
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN as string);

// Register the commands for your guild (server)
(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID as string, // Your bot's application/client ID
                process.env.SERVER_ID as string // Your Discord server/guild ID
            ),
            { body: commands }
        );
        console.log("Slash command registered successfully!");
    } catch (error) {
        console.error("Error registering slash command:", error);
    }
})();