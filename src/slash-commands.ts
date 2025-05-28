import {
    Client,
    PermissionsBitField,
    GuildMember,
    MessageFlags,
    TextChannel,
    EmbedBuilder,
    AttachmentBuilder,
} from "discord.js";

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

export function registerSlashCommands(client: Client) {
    client.on("interactionCreate", async (interaction) => {
        // Only handle chat input commands and the /promote command
        if (!interaction.isChatInputCommand()) return;

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

        if (interaction.commandName == "promote") {
            /**
             * This command promotes users to the next year level.
             * It can be used in three ways:
             * - `it!promote all` - Promotes all members to the next year level.
             * - `it!promote @user` - Promotes a specific user by mention.
             * - `it!promote <role>` - Promotes all members of a specific year level role.
             */

            // Only allow users with Administrator permission to use this command
            if (
                !(
                    interaction.member &&
                    "permissions" in interaction.member &&
                    typeof interaction.member.permissions !== "string" &&
                    interaction.member.permissions.has(
                        PermissionsBitField.Flags.Administrator
                    )
                )
            ) {
                return interaction.reply({
                    content:
                        "**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const guild = interaction.guild;
            if (!guild)
                return interaction.reply({
                    content:
                        "**Guild Not Found!**\n\nIt looks like I can't find the server information right now. Please try again later or contact an administrator if this issue persists. ❌",
                    flags: MessageFlags.Ephemeral,
                });

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

            // Get the target argument from the slash command
            const target = interaction.options.getString("target") ?? "";

            // Helper function to promote a member to the next year
            async function promoteMember(
                member: GuildMember
            ): Promise<boolean> {
                // Do not promote if user has unverified or does not have introduced role

                const isFreshman = member.roles.cache.has(FRESHMAN_ROLE_ID); // Freshman role ID

                // Only check for unverified/introduced if NOT Freshman
                if (!isFreshman) {
                    if (
                        member.roles.cache.has(UNVERIFIED_ROLE_ID) ||
                        !member.roles.cache.has(INTRODUCED_ROLE_ID)
                    ) {
                        return false;
                    }
                }

                // Loop through all year-level roles except the last one (highest year)
                // If the member has a year-level role, remove it and add the next higher year-level role
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

            // Defer reply to avoid interaction timeout (if processing takes time)
            await interaction.deferReply();

            // Handle /promote all
            if (target.toLowerCase() === "all") {
                let count = 0;
                // Promote all members with promotable roles
                for (let i = roles.length - 2; i >= 0; i--) {
                    const fromRole = guild.roles.cache.get(roles[i].id);
                    if (!fromRole) continue;
                    for (const member of fromRole.members.values()) {
                        if (await promoteMember(member)) count++;
                    }
                }
                // Send info message to each year level chat channel
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
                // Send a summary message to the command invoker
                return interaction.editReply(
                    `**Promotion Complete!** 🎉\n\n` +
                        `A total of **${count} members** have been promoted to their next year level!\n\n` +
                        `All year level channels have been notified and are ready for a fresh start. ` +
                        `Let's make this academic year the best one yet—good luck and have fun, everyone! 🚀`
                );
            }

            // Handle /promote @user (mention)
            const mentionMatch = target.match(/^<@!?(\d+)>$/);
            if (mentionMatch) {
                const userId = mentionMatch[1];
                const member = guild.members.cache.get(userId);
                if (!member) {
                    return interaction.editReply({
                        content:
                            "**User Not Found!**\n\nI couldn't find that user in the server. Please double-check the mention or ID and try again! If you think this is an error, make sure the user is still a member of the server. 🔍",
                        flags: MessageFlags.Ephemeral as number,
                    });
                }
                const promoted = await promoteMember(member);
                // Reply with a success or failure message
                return interaction.editReply(
                    promoted
                        ? `**Success!** <@${member.user.id}> has leveled up to the next year! 🎓 Give them a warm welcome and wish them luck on their new journey! 🌟`
                        : `<@${member.user.id}> could not be promoted. They may already be at the highest year level or do not meet the requirements. ⚠️`
                );
            }

            // Handle /promote <role> (by name, mention, or ID)
            const role = guild.roles.cache.find(
                (r) =>
                    r.id === target.replace(/[<@&>]/g, "") ||
                    r.name.toLowerCase() === target.toLowerCase()
            );
            // Check if the found role is in our year-level roles
            if (role && roles.some((roleObj) => roleObj.id === role.id)) {
                let count = 0;
                for (const member of role.members.values()) {
                    if (await promoteMember(member)) count++;
                }
                // Send a summary message to the command invoker
                return interaction.editReply(
                    `**Promotion Success!** 🎓\n\n` +
                        `A total of **${count}** member(s) holding the <@&${role.id}> role have advanced to the next year level! 🚀\n\n` +
                        `Let's congratulate them as they take on new challenges and adventures. Keep up the great work, everyone! 🎉`
                );
            }

            // If none of the above, reply with usage help
            return interaction.editReply({
                content:
                    "**Oops!**❓\nThat doesn't look like a valid argument.\n\n" +
                    "Please use one of the following formats:\n" +
                    "• `/promote all` — Promote everyone to the next year level\n" +
                    "• `/promote @user` — Promote a specific user\n" +
                    "• `/promote <role>` — Promote all members of a specific year level\n\n" +
                    "Give it another try! 🚀",
                flags: MessageFlags.Ephemeral as number,
            });
        } else if (interaction.commandName == "year-level-member-stats") {
            /**
             * This command lists the number of members in each year level
             * and sends a summary message in the channel.
             */

            // Restrict command usage to administrators
            if (
                !(
                    interaction.member &&
                    "permissions" in interaction.member &&
                    typeof interaction.member.permissions !== "string" &&
                    interaction.member.permissions.has(
                        PermissionsBitField.Flags.Administrator
                    )
                )
            ) {
                return interaction.reply({
                    content:
                        "**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const guild = interaction.guild;
            if (!guild) {
                return interaction.reply({
                    content:
                        "**Guild Not Found!**\n\nIt looks like I can't find the server information right now. Please try again later or contact an administrator if this issue persists. ❌",
                    flags: MessageFlags.Ephemeral,
                });
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
            await guild.members.fetch();

            const imagePath = require("path").join(
                __dirname,
                "images",
                "year-level-stats.jpg"
            );

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const attachment = new AttachmentBuilder(imagePath);

            // Build the summary message as an embed with image
            const statsEmbed = new EmbedBuilder()
                .setTitle("Year Level Member Stats")
                .setColor("#3eea8b")
                .setImage("attachment://year-level-stats.jpg");

            let statsDescription = "";
            for (const { id, name } of roles) {
                const role = guild.roles.cache.get(id);
                const count = role ? role.members.size : 0;
                statsDescription += role
                    ? `\n<@&${role.id}>: \`${count}\` member${
                          count === 1 ? "" : "s"
                      }`
                    : `\n${name}: \`0\` members`;
            }
            statsDescription +=
                "\n\n_Keep growing, learning, and supporting each other!_ ✨\n" +
                "If you see your year looking a little empty, invite your classmates to join the fun! 🚀";

            statsEmbed.setDescription(statsDescription);

            // Send the summary as an embed with image attachment (ephemeral)
            await interaction.editReply({
                embeds: [statsEmbed],
                files: [attachment],
            });
        } else if (interaction.commandName === "congratulate-graduates") {
            // Restrict command usage to administrators
            if (
                !(
                    interaction.member &&
                    "permissions" in interaction.member &&
                    typeof interaction.member.permissions !== "string" &&
                    interaction.member.permissions.has(
                        PermissionsBitField.Flags.Administrator
                    )
                )
            ) {
                return interaction.reply({
                    content:
                        "**Access Denied!**\n\nYou need to be an Administrator to use this command.\n\nIf you believe this is a mistake, please contact a server admin. ⛔",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const guild = interaction.guild;
            if (!guild) {
                return interaction.reply({
                    content:
                        "**Guild Not Found!**\n\nIt looks like I can't find the server information right now. Please try again later or contact an administrator if this issue persists. ❌",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const FOURTH_YEAR_ROLE_ID = process.env.FOURTH_YEAR_ROLE_ID!;
            const ALUMNI_ROLE_ID = process.env.ALUMNI_ROLE_ID!;
            const role = guild.roles.cache.get(FOURTH_YEAR_ROLE_ID);

            if (!role) {
                return interaction.reply({
                    content:
                        "Fourth Year role not found. Please check the role ID.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const imagePath = require("path").join(
                __dirname,
                "images",
                "congrats-graduates.jpg"
            );
            const attachment = new AttachmentBuilder(imagePath);

            const embed = new EmbedBuilder()
                .setTitle("Congratulations to our Fourth Year Graduates! 🎉")
                .setDescription(
                    `<@&${role.id}>\n\n` +
                        "You did it! Your hard work, dedication, and perseverance have paid off. " +
                        "We are so proud of each and every one of you. Wishing you all the best in your future endeavors—go out there and shine! 🌟\n\n" +
                        "_From your CLSU IT Discord family_"
                )
                .setImage("attachment://congrats-graduates.jpg")
                .setColor("#3eea8b");

            await interaction.reply({
                embeds: [embed],
                files: [attachment],
            });

            // Alumni embed with reaction
            const alumniEmbed = new EmbedBuilder()
                .setTitle("Grab Your Graduation Hat! 🎓")
                .setDescription(
                    `If you are a graduate, react with 🎓 to this message to receive the <@&${ALUMNI_ROLE_ID}> role!\n\n` +
                        `Once you react, your <@&${FOURTH_YEAR_ROLE_ID}> role will be removed and you'll be given the Alumni role. Congratulations!`
                )
                .setColor("#3eea8b");

            let alumniMessage = null;
            if (
                interaction.channel &&
                interaction.channel.isTextBased() &&
                interaction.channel instanceof TextChannel
            ) {
                alumniMessage = await interaction.channel.send({
                    embeds: [alumniEmbed],
                });
                await alumniMessage.react("🎓");
            }

            // Reaction collector for Alumni role assignment
            const filter = (reaction: any, user: any) =>
                reaction.emoji.name === "🎓" && !user.bot;

            if (alumniMessage) {
                const collector = alumniMessage.createReactionCollector({
                    filter,
                });

                collector.on("collect", async (reaction, user) => {
                    try {
                        if (!guild) return;
                        const member = await guild.members.fetch(user.id);

                        // If user is NOT Fourth Year, remove their 🎓 reaction and return
                        if (!member.roles.cache.has(FOURTH_YEAR_ROLE_ID)) {
                            await reaction.users.remove(user.id);
                            return;
                        }

                        if (
                            member.roles.cache.has(FOURTH_YEAR_ROLE_ID) &&
                            !member.roles.cache.has(ALUMNI_ROLE_ID)
                        ) {
                            const imagePath = require("path").join(
                                __dirname,
                                "images",
                                "you-did-it.jpg"
                            );
                            const attachment = new AttachmentBuilder(imagePath);

                            const alumniDmEmbed = new EmbedBuilder()
                                .setTitle("Hats off to you, Graduate! 🎓")
                                .setDescription(
                                    `Hey <@${member.user.id}>, you’ve officially joined the ranks of our **Alumni**! 🏅\n\n` +
                                        "Your journey as a Fourth Year has come to a triumphant close, but your adventure is just beginning. Thank you for all the memories, laughter, and hard work you’ve shared with the CLSU IT community.\n\n" +
                                        "May your next chapter be filled with success, growth, and endless opportunities. Remember, you’ll always have a home here with us. Welcome to the Alumni family! 💚\n\n" +
                                        "*Keep shining and inspiring others—your story is just getting started!* 🚀"
                                )
                                .setImage("attachment://you-did-it.jpg")
                                .setColor("#3eea8b");

                            await member.roles.remove(FOURTH_YEAR_ROLE_ID);
                            await member.roles.add(ALUMNI_ROLE_ID);
                            await member.send({
                                embeds: [alumniDmEmbed],
                                files: [attachment],
                            });
                        }
                    } catch (err) {
                        console.error("Error assigning Alumni role:", err);
                        if (
                            alumniMessage.channel &&
                            alumniMessage.channel.isTextBased() &&
                            "send" in alumniMessage.channel
                        ) {
                            await alumniMessage.channel.send(
                                `An error occurred while assigning the <@&${ALUMNI_ROLE_ID}> role. Please contact an administrator. ❌`
                            );
                        }
                    }
                });
            }
        }
    });
}
