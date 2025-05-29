"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Import necessary Discord.js classes
const discord_js_1 = require("discord.js");
// Register slash commands and message commands
const message_commands_1 = require("./message-commands");
const slash_commands_1 = require("./slash-commands");
const facebook_access_token_renewer_1 = require("./facebook-access-token-renewer");
// Import the function to schedule Facebook to Discord posting
const schedule_posting_1 = require("./schedule-posting");
// Initialize the Discord client with necessary intents
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
});
// Log when the bot is ready
client.once("ready", async () => {
    console.log(`Bot online! 🤖\n\nLogged in as ${client.user?.tag} 🚀`);
    (0, schedule_posting_1.scheduleFacebookToDiscordPosting)(client);
});
// Register message commands and slash commands
(0, message_commands_1.registerMessageCommands)(client);
(0, slash_commands_1.registerSlashCommands)(client);
(0, facebook_access_token_renewer_1.registerFacebookAcessTokenRenewerCronJobs)();
client.login(process.env.BOT_TOKEN);
