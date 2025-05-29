/**
 * CLSU IT Discord Bot
 *
 * A feature-rich Discord bot for the Central Luzon State University (CLSU) IT community.
 * This bot automates year-level promotions, Facebook event/achievement posting, graduation role transitions,
 * member stats, and more—making server management and community engagement easier for IT moderators, admins, and students.
 *
 * Features:
 *   - Promote all users, specific users, or by role (slash & message commands)
 *   - Automated Facebook to Discord posting (events, achievements, exam schedules, birthdays)
 *   - Year level member stats and reporting
 *   - Congratulate graduates with reaction role changer (4th year to alumni)
 *   - Scheduled and on-demand posting with cron jobs
 *   - Facebook access token auto-renewal
 *
 * Only users with Administrator permission can use the promote and management commands.
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
import { registerFacebookAcessTokenRenewerCronJobs } from "./facebook-access-token-renewer";

// Import the function to schedule Facebook to Discord posting
import { scheduleFacebookToDiscordPosting } from "./schedule-posting";

// Initialize the Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Log when the bot is ready
client.once("ready", async () => {
    console.log(`Bot online! 🤖\n\nLogged in as ${client.user?.tag} 🚀`);

    scheduleFacebookToDiscordPosting(client);
});

// Register message commands and slash commands
registerMessageCommands(client);
registerSlashCommands(client);
registerFacebookAcessTokenRenewerCronJobs();

client.login(process.env.BOT_TOKEN);
