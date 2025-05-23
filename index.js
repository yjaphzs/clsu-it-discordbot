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

require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    MessageFlags,
} = require("discord.js");

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
client.once("ready", () => {
    console.log(`🤖 Bot online! Logged in as ${client.user.tag} 🚀`);
});

// Slash command handler for /promote
client.on("interactionCreate", async (interaction) => {
    // Only handle chat input commands and the /promote command
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "promote") return;

    // Only allow users with Administrator permission to use this command
    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
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
        { id: "1374391082648862852", name: "Freshman" },
        { id: "1276560712336146442", name: "First Year" },
        { id: "1276560813662142527", name: "Second Year" },
        { id: "1276560867248439307", name: "Third Year" },
        { id: "1276560973750206484", name: "Fourth Year" },
    ];

    // Make sure all members are cached
    await guild.members.fetch();

    // Get the target argument from the slash command
    const target = interaction.options.getString("target");

    const UNVERIFIED_ROLE_ID = "1276428420007596125";
    const INTRODUCED_ROLE_ID = "1280119205429117079";

    // Helper function to promote a member to the next year
    async function promoteMember(member) {
        // Do not promote if user has unverified or does not have introduced role

        const isFreshman = member.roles.cache.has("1374391082648862852"); // Freshman role ID

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
        for (const { roleId, name, channelId } of yearLevelChannels) {
            const channel = guild.channels.cache.get(channelId);
            if (channel && channel.isTextBased()) {
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
                flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
    });
});

client.on("interactionCreate", async (interaction) => {
    // Only handle the /listyearlevels slash command
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "listyearlevels") return;

    // Restrict command usage to administrators
    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
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
        { id: "1374391082648862852", name: "Freshman" },
        { id: "1276560712336146442", name: "First Year" },
        { id: "1276560813662142527", name: "Second Year" },
        { id: "1276560867248439307", name: "Third Year" },
        { id: "1276560973750206484", name: "Fourth Year" },
    ];

    // Ensure all members are cached so we get accurate counts
    await guild.members.fetch();

    // Build the summary message
    let result = "**Year Level Member Stats**\n";
    for (const { id, name } of roles) {
        const role = guild.roles.cache.get(id);
        const count = role ? role.members.size : 0;
        result += `\n<@&${role.id}>: \`${count}\` member${
            count === 1 ? "" : "s"
        }`;
    }
    result +=
        "\n\n_Keep growing, learning, and supporting each other!_ ✨\n" +
        "If you see your year looking a little empty, invite your classmates to join the fun! 🚀";

    // Send the summary as an ephemeral message (only visible to the user)
    await interaction.reply({
        content: result,
        flags: MessageFlags.Ephemeral,
    });
});

client.login(process.env.BOT_TOKEN);
