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
exports.registerMessageCommands = registerMessageCommands;
const discord_js_1 = require("discord.js");
// Load environment variables
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function registerMessageCommands(client) {
    client.on("messageCreate", async (message) => {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild)
            return;
        // Get role IDs from environment variables
        const FRESHMAN_ROLE_ID = process.env.FRESHMAN_ROLE_ID;
        const FIRST_YEAR_ROLE_ID = process.env.FIRST_YEAR_ROLE_ID;
        const SECOND_YEAR_ROLE_ID = process.env.SECOND_YEAR_ROLE_ID;
        const THIRD_YEAR_ROLE_ID = process.env.THIRD_YEAR_ROLE_ID;
        const FOURTH_YEAR_ROLE_ID = process.env.FOURTH_YEAR_ROLE_ID;
        const UNVERIFIED_ROLE_ID = process.env.UNVERIFIED_ROLE_ID;
        const INTRODUCED_ROLE_ID = process.env.INTRODUCED_ROLE_ID;
        const FIRST_YEAR_CHANNEL_ID = process.env.FIRST_YEAR_CHANNEL_ID;
        const SECOND_YEAR_CHANNEL_ID = process.env.SECOND_YEAR_CHANNEL_ID;
        const THIRD_YEAR_CHANNEL_ID = process.env.THIRD_YEAR_CHANNEL_ID;
        const FOURTH_YEAR_CHANNEL_ID = process.env.FOURTH_YEAR_CHANNEL_ID;
        const ALUMNI_ROLE_ID = process.env.ALUMNI_ROLE_ID;
        // Command prefix and name (case-insensitive)
        if (message.content.toLowerCase().startsWith("it!promote")) {
            /**
             * This command promotes users to the next year level.
             * It can be used in three ways:
             * - `it!promote all` - Promotes all members to the next year level.
             * - `it!promote @user` - Promotes a specific user by mention.
             * - `it!promote <role>` - Promotes all members of a specific year level role.
             */
            // Command prefix
            const prefix = "it!promote";
            // Only allow users with Administrator permission to use this command
            if (!message.member?.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator)) {
                return message.reply("**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔");
            }
            const guild = message.guild;
            if (!guild) {
                return message.reply("**Guild Not Found!**\n\nIt looks like I can't find the server information right now. Please try again later or contact an administrator if this issue persists. ❌");
            }
            // List of role IDs in promotion order
            const roles = [
                { id: FRESHMAN_ROLE_ID, name: "Freshman" },
                { id: FIRST_YEAR_ROLE_ID, name: "First Year" },
                { id: SECOND_YEAR_ROLE_ID, name: "Second Year" },
                { id: THIRD_YEAR_ROLE_ID, name: "Third Year" },
                { id: FOURTH_YEAR_ROLE_ID, name: "Fourth Year" },
            ];
            // Make sure all members are cached
            await guild.members.fetch();
            // Get the argument after the prefix
            const args = message.content
                .slice(prefix.length)
                .trim()
                .split(/ +/);
            const target = args.join(" ");
            // Helper function to promote a member to the next year
            async function promoteMember(member) {
                const isFreshman = member.roles.cache.has(FRESHMAN_ROLE_ID);
                if (!isFreshman) {
                    if (member.roles.cache.has(UNVERIFIED_ROLE_ID) ||
                        !member.roles.cache.has(INTRODUCED_ROLE_ID)) {
                        return false;
                    }
                }
                for (let i = roles.length - 2; i >= 0; i--) {
                    if (member.roles.cache.has(roles[i].id)) {
                        await member.roles.remove(roles[i].id);
                        await member.roles.add(roles[i + 1].id);
                        // Log the member's name and the from/to roles
                        console.log(`Promoted: ${member.user.tag} from "${roles[i].name}" to "${roles[i + 1].name}"`);
                        return true;
                    }
                }
                return false;
            }
            // yearLevelChannels are the channels to notify when promoting all members
            const yearLevelChannels = [
                {
                    roleId: FIRST_YEAR_ROLE_ID,
                    name: "First Year",
                    channelId: FIRST_YEAR_CHANNEL_ID,
                },
                {
                    roleId: SECOND_YEAR_ROLE_ID,
                    name: "Second Year",
                    channelId: SECOND_YEAR_CHANNEL_ID,
                },
                {
                    roleId: THIRD_YEAR_ROLE_ID,
                    name: "Third Year",
                    channelId: THIRD_YEAR_CHANNEL_ID,
                },
                {
                    roleId: FOURTH_YEAR_ROLE_ID,
                    name: "Fourth Year",
                    channelId: FOURTH_YEAR_CHANNEL_ID,
                },
            ];
            // Handle "it!promote all"
            if (target.toLowerCase() === "all") {
                console.log("Starting promotion for all members...");
                let count = 0;
                for (let i = roles.length - 2; i >= 0; i--) {
                    const fromRole = guild.roles.cache.get(roles[i].id);
                    if (!fromRole)
                        continue;
                    for (const member of fromRole.members.values()) {
                        if (await promoteMember(member))
                            count++;
                    }
                }
                for (const { channelId, roleId } of yearLevelChannels) {
                    const channel = guild.channels.cache.get(channelId);
                    if (channel && channel.isTextBased() && "send" in channel) {
                        // Send a promotion complete message with an image
                        const imagePath = require("path").join(__dirname, "images", "fresh-start.jpg");
                        // Create an attachment for the promotion complete image
                        const attachment = new discord_js_1.AttachmentBuilder(imagePath);
                        // Create the fresh start embed
                        const freshStartEmbed = new discord_js_1.EmbedBuilder()
                            .setTitle("A Fresh Start! 🎉")
                            .setDescription(`Welcome, <@&${roleId}> students, to a brand new academic year! 🌟\n\n` +
                            `This channel is now your official hangout for all things.\n` +
                            `Feel free to introduce yourselves, ask questions, and support each other as you journey through this year together.\n\n` +
                            `*Please note: All previous messages are memories from the last batch. Let's make new ones!*\n\n` +
                            `Wishing everyone an amazing, productive, and fun school year ahead! 🚀`)
                            .setImage("attachment://fresh-start.jpg")
                            .setColor("#3eea8b");
                        // Send the fresh start message with the image attachment
                        await channel.send({
                            embeds: [freshStartEmbed],
                            files: [attachment],
                        });
                    }
                }
                // Send a promotion complete message with an image
                const imagePath = require("path").join(__dirname, "images", "promotion-complete.jpg");
                // Create an attachment for the promotion complete image
                const attachment = new discord_js_1.AttachmentBuilder(imagePath);
                // Create the promotion complete embed
                const promotionEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle("Promotion Complete! 🎉")
                    .setDescription(`A total of **${count} members** have been promoted to their next year level!\n\n` +
                    `All year level channels have been notified and are ready for a fresh start.\n` +
                    `Let's make this academic year the best one yet—good luck and have fun, everyone! 🚀`)
                    .setImage("attachment://promotion-complete.jpg")
                    .setColor("#3eea8b");
                // Send the promotion complete message with the image attachment
                return message.channel.send({
                    embeds: [promotionEmbed],
                    files: [attachment],
                });
            }
            // Handle "it!promote @user" (mention)
            const mentionMatch = target.match(/^<@!?(\d+)>$/);
            if (mentionMatch) {
                const userId = mentionMatch[1];
                const member = guild.members.cache.get(userId);
                if (!member) {
                    return message.channel.send("**User Not Found!**\n\nI couldn't find that user in the server. Please double-check the mention or ID and try again! If you think this is an error, make sure the user is still a member of the server. 🔍");
                }
                const promoted = await promoteMember(member);
                // Check if the member was promoted
                if (promoted) {
                    // Send a promotion complete message with an image
                    const imagePath = require("path").join(__dirname, "images", "promotion-complete.jpg");
                    // Create an attachment for the promotion complete image
                    const attachment = new discord_js_1.AttachmentBuilder(imagePath);
                    // Create the promotion complete embed
                    const promotionEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle("Promotion Complete! 🎉")
                        .setDescription(`<@${member.user.id}> has leveled up to the next year!\n\n` +
                        `**New Role:** <@&${roles.find((r) => member.roles.cache.has(r.id))?.id || "Unknown"}>\n\n` +
                        `Give them a warm welcome and wish them luck on their new journey! 🌟`)
                        .setImage("attachment://promotion-complete.jpg")
                        .setColor("#3eea8b");
                    // Send the promotion complete message with the image attachment
                    return message.channel.send({
                        embeds: [promotionEmbed],
                        files: [attachment],
                    });
                }
                else {
                    return message.channel.send(`<@${member.user.id}> could not be promoted. They may already be at the highest year level or do not meet the requirements. ⚠️`);
                }
            }
            // Handle "it!promote <role>" (by name, mention, or ID)
            const role = guild.roles.cache.find((r) => r.id === target.replace(/[<@&>]/g, "") ||
                r.name.toLowerCase() === target.toLowerCase());
            if (role && roles.some((roleObj) => roleObj.id === role.id)) {
                let count = 0;
                for (const member of role.members.values()) {
                    if (await promoteMember(member))
                        count++;
                }
                // Send a promotion complete message with an image
                const imagePath = require("path").join(__dirname, "images", "promotion-complete.jpg");
                // Create an attachment for the promotion complete image
                const attachment = new discord_js_1.AttachmentBuilder(imagePath);
                // Create the promotion complete embed
                const promotionEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle("Promotion Complete! 🎉")
                    .setDescription(`A total of **${count}** member(s) holding the <@&${role.id}> role have advanced to the next year level!\n\n` +
                    `Let's congratulate them as they take on new challenges and adventures. Keep up the great work, everyone! 🚀`)
                    .setImage("attachment://promotion-complete.jpg")
                    .setColor("#3eea8b");
                // Send the promotion complete message with the image attachment
                return message.channel.send({
                    embeds: [promotionEmbed],
                    files: [attachment],
                });
            }
            // If none of the above, reply with usage help
            return message.channel.send("**Oops!**❓\nThat doesn't look like a valid argument.\n\n" +
                "Please use one of the following formats:\n" +
                "• `it!promote all` — Promote everyone to the next year level\n" +
                "• `it!promote @user` — Promote a specific user\n" +
                "• `it!promote <role>` — Promote all members of a specific year level\n\n" +
                "Give it another try! 🚀");
        }
        else if (message.content.trim().toLowerCase() ===
            "it!year-level-member-stats") {
            /**
             * This command lists the number of members in each year level
             * and sends a summary message in the channel.
             */
            // Restrict command usage to administrators
            if (!message.member?.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator)) {
                return message.reply("**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔");
            }
            // Define the year-level roles and their IDs
            const roles = [
                { id: FRESHMAN_ROLE_ID, name: "Freshman" },
                { id: FIRST_YEAR_ROLE_ID, name: "First Year" },
                { id: SECOND_YEAR_ROLE_ID, name: "Second Year" },
                { id: THIRD_YEAR_ROLE_ID, name: "Third Year" },
                { id: FOURTH_YEAR_ROLE_ID, name: "Fourth Year" },
            ];
            // Ensure all members are cached so we get accurate counts
            await message.guild.members.fetch();
            const imagePath = require("path").join(__dirname, "images", "year-level-stats.jpg");
            const attachment = new discord_js_1.AttachmentBuilder(imagePath);
            // Build the summary message as an embed with image
            const statsEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("Year Level Member Stats")
                .setColor("#3eea8b")
                .setImage("attachment://year-level-stats.jpg");
            let statsDescription = "";
            for (const { id, name } of roles) {
                const role = message.guild.roles.cache.get(id);
                const count = role ? role.members.size : 0;
                statsDescription += role
                    ? `\n<@&${role.id}>: \`${count}\` member${count === 1 ? "" : "s"}`
                    : `\n${name}: \`0\` members`;
            }
            statsDescription +=
                "\n\n_Keep growing, learning, and supporting each other!_ ✨\n" +
                    "If you see your year looking a little empty, invite your classmates to join the fun! 🚀";
            statsEmbed.setDescription(statsDescription);
            // Send the summary as an embed with image attachment
            await message.channel.send({
                embeds: [statsEmbed],
                files: [attachment],
            });
        }
        else if (message.content.trim().toLowerCase() === "it!congratulate-graduates") {
            /**
             * This command congratulates all Fourth Year members
             * on their graduation and mentions them in the channel.
             */
            // Restrict command usage to administrators
            if (!message.member?.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator)) {
                return message.reply("**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔");
            }
            // Fourth Year role ID from .env
            const role = message.guild.roles.cache.get(FOURTH_YEAR_ROLE_ID);
            if (!role) {
                return message.channel.send("Fourth Year role not found. Please check the role ID.");
            }
            const imagePath = require("path").join(__dirname, "images", "congrats-graduates.jpg");
            const attachment = new discord_js_1.AttachmentBuilder(imagePath);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("Congratulations to our Fourth Year Graduates! 🎉")
                .setDescription(`<@&${role.id}>\n\n` +
                "You did it! Your hard work, dedication, and perseverance have paid off. " +
                "We are so proud of each and every one of you. Wishing you all the best in your future endeavors—go out there and shine! 🌟\n\n" +
                "_From your CLSU IT Discord family_")
                .setImage("attachment://congrats-graduates.jpg")
                .setColor("#3eea8b");
            await message.channel.send({
                embeds: [embed],
                files: [attachment],
            });
            // Alumni embed with reaction
            const alumniEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("Grab Your Graduation Hat! 🎓")
                .setDescription(`If you are a graduate, react with 🎓 to this message to receive the <@&${ALUMNI_ROLE_ID}> role!\n\n` +
                `Once you react, your <@&${FOURTH_YEAR_ROLE_ID}> role will be removed and you'll be given the Alumni role. Congratulations!`)
                .setColor("#3eea8b");
            const alumniMessage = await message.channel.send({
                embeds: [alumniEmbed],
            });
            await alumniMessage.react("🎓");
            // Reaction collector for Alumni role assignment
            const filter = (reaction, user) => reaction.emoji.name === "🎓" && !user.bot;
            const collector = alumniMessage.createReactionCollector({ filter });
            collector.on("collect", async (reaction, user) => {
                try {
                    if (!message.guild)
                        return;
                    const member = await message.guild.members.fetch(user.id);
                    // If user is NOT Fourth Year, remove their 🎓 reaction and return
                    if (!member.roles.cache.has(FOURTH_YEAR_ROLE_ID)) {
                        await reaction.users.remove(user.id);
                        return;
                    }
                    if (member.roles.cache.has(FOURTH_YEAR_ROLE_ID) &&
                        !member.roles.cache.has(ALUMNI_ROLE_ID)) {
                        const imagePath = require("path").join(__dirname, "images", "you-did-it.jpg");
                        const attachment = new discord_js_1.AttachmentBuilder(imagePath);
                        await member.roles.remove(FOURTH_YEAR_ROLE_ID);
                        await member.roles.add(ALUMNI_ROLE_ID);
                        const alumniDmEmbed = new discord_js_1.EmbedBuilder()
                            .setTitle("Hats off to you, Graduate! 🎓")
                            .setDescription(`Hey <@${member.user.id}>, you’ve officially joined the ranks of our **Alumni**! 🏅\n\n` +
                            "Your journey as a Fourth Year has come to a triumphant close, but your adventure is just beginning. Thank you for all the memories, laughter, and hard work you’ve shared with the CLSU IT community.\n\n" +
                            "May your next chapter be filled with success, growth, and endless opportunities. Remember, you’ll always have a home here with us. Welcome to the Alumni family! 💚\n\n" +
                            "*Keep shining and inspiring others—your story is just getting started!* 🚀")
                            .setImage("attachment://you-did-it.jpg")
                            .setColor("#3eea8b");
                        await member.send({
                            embeds: [alumniDmEmbed],
                            files: [attachment],
                        });
                    }
                }
                catch (err) {
                    console.error("Error assigning Alumni role:", err);
                    await message.channel.send(`An error occurred while assigning the <@&${ALUMNI_ROLE_ID}> role. Please contact an administrator. ❌`);
                }
            });
        }
    });
}
