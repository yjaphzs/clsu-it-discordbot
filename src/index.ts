/**
 * CLSU IT Discord Bot for Role Promotion
 *
 * This bot allows moderators or admins to promote users' year roles in a Discord server.
 * Supported via both legacy message commands and slash commands:
 *   - Promote all users:           /promote all
 *   - Promote a specific user:     /promote @user
 *   - Promote by role:             /promote <role>
 *
 * Only users with Administrator permission can use the promote command.
 *
 * Author: Jan Bautista
 * Date: May 21, 2025
 */

import * as dotenv from "dotenv";

dotenv.config();

// Import necessary Discord.js classes
import { Client, GatewayIntentBits } from "discord.js";

// Register slash commands and message commands
import { registerMessageCommands } from "./message-commands";
import { registerSlashCommands } from "./slash-commands";

// Import the function to schedule Facebook to Discord posting
import { scheduleFacebookToDiscordPosting } from "./schedule-posting";

// Initialize the Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Log when the bot is ready
client.once("ready", async () => {
    console.log(`Bot online! 🤖\n\nLogged in as ${client.user?.tag} 🚀`);

    scheduleFacebookToDiscordPosting();
});

// Register message commands and slash commands
registerMessageCommands(client);
registerSlashCommands(client);

client.login(process.env.BOT_TOKEN);
