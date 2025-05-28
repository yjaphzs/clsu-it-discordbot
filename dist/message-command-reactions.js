"use strict";
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
exports.registerMessageCommandReactions = registerMessageCommandReactions;
// Load environment variables
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dataDir = path.resolve(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const congratsPath = path.join(dataDir, "congrats-graduates-messages.json");
function registerMessageCommandReactions(client) {
    client.on("messageReactionAdd", async (reaction, user) => {
        console.log("Message reaction added:", reaction.emoji.name, "by", user.tag);
        const FOURTH_YEAR_ROLE_ID = process.env.FOURTH_YEAR_ROLE_ID;
        const ALUMNI_ROLE_ID = process.env.ALUMNI_ROLE_ID;
        if (reaction.emoji.name == "🎓") {
            // Load alumni message IDs from congratsPath
            let congratsIds = [];
            if (fs.existsSync(congratsPath)) {
                try {
                    congratsIds = JSON.parse(fs.readFileSync(congratsPath, "utf-8"));
                    if (!Array.isArray(congratsIds))
                        congratsIds = [];
                }
                catch {
                    congratsIds = [];
                }
            }
            // Only process if this is an alumni message
            if (!congratsIds.includes(reaction.message.id))
                return;
            // Ignore bot reactions
            if (user.bot)
                return;
            // Fetch the member
            if (!reaction.message.guild)
                return;
            const member = await reaction.message.guild.members.fetch(user.id);
            // Only update if member has Fourth Year and not yet Alumni
            if (member.roles.cache.has(FOURTH_YEAR_ROLE_ID) &&
                !member.roles.cache.has(ALUMNI_ROLE_ID)) {
                try {
                    await member.roles.remove(FOURTH_YEAR_ROLE_ID);
                    await member.roles.add(ALUMNI_ROLE_ID);
                    try {
                        await member.send(`Congratulations <@${member.user.id}>! You have been given the <@&${ALUMNI_ROLE_ID}> role. Welcome to the next chapter! 🎓`);
                    }
                    catch (dmErr) {
                        console.error("Could not send DM to user:", dmErr);
                        // Only send to channel if it supports .send()
                        if (reaction.message.channel &&
                            reaction.message.channel.isTextBased &&
                            reaction.message.channel.isTextBased() &&
                            "send" in reaction.message.channel) {
                            await reaction.message.channel.send(`<@${member.user.id}> has been given the Alumni role, but I couldn't DM them.`);
                        }
                    }
                }
                catch (err) {
                    console.error("Error assigning Alumni role:", err);
                    if (reaction.message.channel &&
                        reaction.message.channel.isTextBased &&
                        reaction.message.channel.isTextBased() &&
                        "send" in reaction.message.channel) {
                        await reaction.message.channel.send(`An error occurred while assigning the <@&${ALUMNI_ROLE_ID}> role. Please contact an administrator. ❌`);
                    }
                }
            }
        }
    });
}
