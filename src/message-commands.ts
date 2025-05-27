import { Client, PermissionsBitField, GuildMember } from "discord.js";

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

export function registerMessageCommands(client: Client) {
    client.on("messageCreate", async (message) => {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) return;

        // Get role IDs from environment variables
        const FRESHMAN_ROLE_ID = process.env.FRESHMAN_ROLE_ID!;
        const FIRST_YEAR_ROLE_ID = process.env.FIRST_YEAR_ROLE_ID!;
        const SECOND_YEAR_ROLE_ID = process.env.SECOND_YEAR_ROLE_ID!;
        const THIRD_YEAR_ROLE_ID = process.env.THIRD_YEAR_ROLE_ID!;
        const FOURTH_YEAR_ROLE_ID = process.env.FOURTH_YEAR_ROLE_ID!;
        const UNVERIFIED_ROLE_ID = process.env.UNVERIFIED_ROLE_ID!;
        const INTRODUCED_ROLE_ID = process.env.INTRODUCED_ROLE_ID!;
        const FIRST_YEAR_CHANNEL_ID = process.env.FIRST_YEAR_CHANNEL_ID!;
        const SECOND_YEAR_CHANNEL_ID = process.env.SECOND_YEAR_CHANNEL_ID!;
        const THIRD_YEAR_CHANNEL_ID = process.env.THIRD_YEAR_CHANNEL_ID!;
        const FOURTH_YEAR_CHANNEL_ID = process.env.FOURTH_YEAR_CHANNEL_ID!;

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
            if (
                !message.member?.permissions.has(
                    PermissionsBitField.Flags.Administrator
                )
            ) {
                return message.reply(
                    "**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔"
                );
            }

            const guild = message.guild;
            if (!guild) {
                return message.reply(
                    "**Guild Not Found!**\n\nIt looks like I can't find the server information right now. Please try again later or contact an administrator if this issue persists. ❌"
                );
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
            async function promoteMember(
                member: GuildMember
            ): Promise<boolean> {
                const isFreshman = member.roles.cache.has(FRESHMAN_ROLE_ID);
                if (!isFreshman) {
                    if (
                        member.roles.cache.has(UNVERIFIED_ROLE_ID) ||
                        !member.roles.cache.has(INTRODUCED_ROLE_ID)
                    ) {
                        return false;
                    }
                }
                for (let i = roles.length - 2; i >= 0; i--) {
                    if (member.roles.cache.has(roles[i].id)) {
                        await member.roles.remove(roles[i].id);
                        await member.roles.add(roles[i + 1].id);
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
                    channelId: FIRST_YEAR_CHANNEL_ID!,
                },
                {
                    roleId: SECOND_YEAR_ROLE_ID,
                    name: "Second Year",
                    channelId: SECOND_YEAR_CHANNEL_ID!,
                },
                {
                    roleId: THIRD_YEAR_ROLE_ID,
                    name: "Third Year",
                    channelId: THIRD_YEAR_CHANNEL_ID!,
                },
                {
                    roleId: FOURTH_YEAR_ROLE_ID,
                    name: "Fourth Year",
                    channelId: FOURTH_YEAR_CHANNEL_ID!,
                },
            ];

            // Handle "it!promote all"
            if (target.toLowerCase() === "all") {
                let count = 0;
                for (let i = roles.length - 2; i >= 0; i--) {
                    const fromRole = guild.roles.cache.get(roles[i].id);
                    if (!fromRole) continue;
                    for (const member of fromRole.members.values()) {
                        if (await promoteMember(member)) count++;
                    }
                }
                for (const { channelId, name } of yearLevelChannels) {
                    const channel = guild.channels.cache.get(channelId);
                    if (channel && channel.isTextBased() && "send" in channel) {
                        await channel.send(
                            `**A Fresh Start!** :tada:\n` +
                                `Welcome, **${name}** students, to a brand new academic year! 🎓\n\n` +
                                `This channel is now your official hangout for all things ${name}.\n` +
                                `Feel free to introduce yourselves, ask questions, and support each other as you journey through this year together.\n\n` +
                                `*Please note: All previous messages are memories from the last batch. Let's make new ones!*\n\n` +
                                `Wishing everyone an amazing, productive, and fun school year ahead! 🚀`
                        );
                    }
                }
                return message.channel.send(
                    `**Promotion Complete!** 🎉\n\n` +
                        `A total of **${count} members** have been promoted to their next year level!\n\n` +
                        `All year level channels have been notified and are ready for a fresh start. ` +
                        `Let's make this academic year the best one yet—good luck and have fun, everyone! 🚀`
                );
            }

            // Handle "it!promote @user" (mention)
            const mentionMatch = target.match(/^<@!?(\d+)>$/);
            if (mentionMatch) {
                const userId = mentionMatch[1];
                const member = guild.members.cache.get(userId);
                if (!member) {
                    return message.channel.send(
                        "**User Not Found!**\n\nI couldn't find that user in the server. Please double-check the mention or ID and try again! If you think this is an error, make sure the user is still a member of the server. 🔍"
                    );
                }
                const promoted = await promoteMember(member);
                return message.channel.send(
                    promoted
                        ? `**Success!** <@${member.user.id}> has leveled up to the next year! 🎓 Give them a warm welcome and wish them luck on their new journey! 🌟`
                        : `<@${member.user.id}> could not be promoted. They may already be at the highest year level or do not meet the requirements. ⚠️`
                );
            }

            // Handle "it!promote <role>" (by name, mention, or ID)
            const role = guild.roles.cache.find(
                (r) =>
                    r.id === target.replace(/[<@&>]/g, "") ||
                    r.name.toLowerCase() === target.toLowerCase()
            );
            if (role && roles.some((roleObj) => roleObj.id === role.id)) {
                let count = 0;
                for (const member of role.members.values()) {
                    if (await promoteMember(member)) count++;
                }
                return message.channel.send(
                    `**Promotion Success!** 🎓\n\n` +
                        `A total of **${count}** member(s) holding the <@&${role.id}> role have advanced to the next year level! 🚀\n\n` +
                        `Let's congratulate them as they take on new challenges and adventures. Keep up the great work, everyone! 🎉`
                );
            }

            // If none of the above, reply with usage help
            return message.channel.send(
                "**Oops!**❓\nThat doesn't look like a valid argument.\n\n" +
                    "Please use one of the following formats:\n" +
                    "• `it!promote all` — Promote everyone to the next year level\n" +
                    "• `it!promote @user` — Promote a specific user\n" +
                    "• `it!promote <role>` — Promote all members of a specific year level\n\n" +
                    "Give it another try! 🚀"
            );
        } else if (
            message.content.trim().toLowerCase() ===
            "it!year-level-member-stats"
        ) {
            /**
             * This command lists the number of members in each year level
             * and sends a summary message in the channel.
             */

            // Restrict command usage to administrators
            if (
                !message.member?.permissions.has(
                    PermissionsBitField.Flags.Administrator
                )
            ) {
                return message.reply(
                    "**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔"
                );
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

            // Build the summary message
            let result = "**Year Level Member Stats**\n";
            for (const { id, name } of roles) {
                const role = message.guild.roles.cache.get(id);
                const count = role ? role.members.size : 0;
                result += role
                    ? `\n<@&${role.id}>: \`${count}\` member${
                          count === 1 ? "" : "s"
                      }`
                    : `\n${name}: \`0\` members`;
            }
            result +=
                "\n\n_Keep growing, learning, and supporting each other!_ ✨\n" +
                "If you see your year looking a little empty, invite your classmates to join the fun! 🚀";

            // Send the summary as a public message
            await message.channel.send(result);
        } else if (
            message.content.trim().toLowerCase() === "it!congratulate-graduates"
        ) {
            /**
             * This command congratulates all Fourth Year members
             * on their graduation and mentions them in the channel.
             */

            // Restrict command usage to administrators
            if (
                !message.member?.permissions.has(
                    PermissionsBitField.Flags.Administrator
                )
            ) {
                return message.reply(
                    "**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔"
                );
            }

            // Fourth Year role ID from .env
            const role = message.guild.roles.cache.get(FOURTH_YEAR_ROLE_ID);

            if (!role) {
                return message.channel.send(
                    "Fourth Year role not found. Please check the role ID."
                );
            }

            // Mention all Fourth Year members
            const graduates = Array.from(role.members.values());
            if (graduates.length === 0) {
                return message.channel.send(
                    "There are no Fourth Year members to congratulate!"
                );
            }

            const mentions = graduates
                .map((member) => `<@${member.user.id}>`)
                .join(" ");
            return message.channel.send(
                `🎓 **Congratulations to our Fourth Year Graduates!** 🎉\n\n` +
                    `${mentions}\n\n` +
                    "You did it! Your hard work, dedication, and perseverance have paid off. " +
                    "We are so proud of each and every one of you. Wishing you all the best in your future endeavors—go out there and shine! 🌟\n\n" +
                    "_From your CLSU IT Discord family_"
            );
        }
    });
}
