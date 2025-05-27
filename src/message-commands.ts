import { Client, PermissionsBitField, GuildMember } from "discord.js";

export function registerMessageCommands(client: Client) {
    client.on("messageCreate", async (message) => {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) return;

        // Command prefix and name (case-insensitive)
        if (message.content.toLowerCase().startsWith("it!promote")) {
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
                { id: "1374391082648862852", name: "Freshman" },
                { id: "1276560712336146442", name: "First Year" },
                { id: "1276560813662142527", name: "Second Year" },
                { id: "1276560867248439307", name: "Third Year" },
                { id: "1276560973750206484", name: "Fourth Year" },
            ];

            // Make sure all members are cached
            await guild.members.fetch();

            // Get the argument after the prefix
            const args = message.content
                .slice(prefix.length)
                .trim()
                .split(/ +/);
            const target = args.join(" ");

            const UNVERIFIED_ROLE_ID = "1276428420007596125";
            const INTRODUCED_ROLE_ID = "1280119205429117079";

            // Helper function to promote a member to the next year
            async function promoteMember(
                member: GuildMember
            ): Promise<boolean> {
                const isFreshman = member.roles.cache.has(
                    "1374391082648862852"
                );
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
                    roleId: "1276560712336146442",
                    name: "First Year",
                    channelId: "1279060126627528714",
                },
                {
                    roleId: "1276560813662142527",
                    name: "Second Year",
                    channelId: "1279062445993758793",
                },
                {
                    roleId: "1276560867248439307",
                    name: "Third Year",
                    channelId: "1279062500540813352",
                },
                {
                    roleId: "1276560973750206484",
                    name: "Fourth Year",
                    channelId: "1279062542106365963",
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
                { id: "1374391082648862852", name: "Freshman" },
                { id: "1276560712336146442", name: "First Year" },
                { id: "1276560813662142527", name: "Second Year" },
                { id: "1276560867248439307", name: "Third Year" },
                { id: "1276560973750206484", name: "Fourth Year" },
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
        }
    });
}
