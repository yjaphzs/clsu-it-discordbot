"use strict";
/**
 *
 * This script registers the /promote slash command for your Discord bot.
 * Run this file manually whenever you update your slash commands.
 *
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
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Define the slash command(s) to register
const commands = [
    new discord_js_1.SlashCommandBuilder()
        .setName("promote")
        .setDescription("Promote users by year, user, or role")
        .addStringOption((option) => option
        .setName("target")
        .setDescription('Specify "all", @user, or a role name')
        .setRequired(true))
        .toJSON(),
    new discord_js_1.SlashCommandBuilder()
        .setName("year-level-member-stats")
        .setDescription("List all members per year level")
        .toJSON(),
    new discord_js_1.SlashCommandBuilder()
        .setName("congratulate-graduates")
        .setDescription("Congratulate all Fourth Year members and start the alumni role process")
        .toJSON(),
];
// Set up REST client with your bot token
const rest = new discord_js_1.REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
// Register the commands for your guild (server)
(async () => {
    try {
        await rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, // Your bot's application/client ID
        process.env.SERVER_ID // Your Discord server/guild ID
        ), { body: commands });
        console.log("Slash command registered successfully!");
    }
    catch (error) {
        console.error("Error registering slash command:", error);
    }
})();
