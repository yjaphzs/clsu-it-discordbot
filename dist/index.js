"use strict";
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
    (0, schedule_posting_1.scheduleFacebookToDiscordPosting)();
});
// Register message commands and slash commands
(0, message_commands_1.registerMessageCommands)(client);
(0, slash_commands_1.registerSlashCommands)(client);
client.login(process.env.BOT_TOKEN);
