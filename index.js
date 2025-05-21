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

require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// Initialize the Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Log when the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//   if (
//     !message.content.startsWith('!promote') ||
//     !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
//   ) return;

//   const guild = message.guild;
//   if (!guild) return;

//   // Role IDs in order
//   const roles = [
//     "1374391082648862852", // Freshman
//     "1276560712336146442", // First Year
//     "1276560813662142527", // Second Year
//     "1276560867248439307", // Third Year
//     "1276560973750206484"  // Fourth Year
//   ];

//   // Fetch all members
//   await guild.members.fetch();

//   const args = message.content.trim().split(/\s+/).slice(1);

//   // Helper: promote a member if possible
//   async function promoteMember(member) {
//     for (let i = roles.length - 2; i >= 0; i--) {
//       if (member.roles.cache.has(roles[i])) {
//         await member.roles.remove(roles[i]);
//         await member.roles.add(roles[i + 1]);
//         return true;
//       }
//     }
//     return false;
//   }

//   // !promote all
//   if (args.length === 0 || args[0].toLowerCase() === "all") {
//     let count = 0;
//     for (let i = roles.length - 2; i >= 0; i--) {
//       const fromRole = guild.roles.cache.get(roles[i]);
//       if (!fromRole) continue;
//       for (const member of fromRole.members.values()) {
//         if (await promoteMember(member)) count++;
//       }
//     }
//     return message.reply(`Promoted ${count} members.`);
//   }

//   // !promote <@user>
//   if (message.mentions.members.size > 0) {
//     let count = 0;
//     for (const member of message.mentions.members.values()) {
//       if (await promoteMember(member)) count++;
//     }
//     return message.reply(`Promoted ${count} mentioned user(s).`);
//   }

//   // !promote <role>
//   const roleArg = args.join(" ");
//   const role = guild.roles.cache.find(r =>
//     r.id === roleArg.replace(/[<@&>]/g, "") ||
//     r.name.toLowerCase() === roleArg.toLowerCase()
//   );
//   if (role && roles.includes(role.id)) {
//     let count = 0;
//     for (const member of role.members.values()) {
//       if (await promoteMember(member)) count++;
//     }
//     return message.reply(`Promoted ${count} member(s) with role ${role.name}.`);
//   }

//   message.reply("Invalid argument. Use `!promote all`, `!promote @user`, or `!promote <role>`.");
// });

// Slash command handler for /promote
client.on('interactionCreate', async interaction => {
  // Only handle chat input commands and the /promote command
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'promote') return;

  // Only allow users with Administrator permission to use this command
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
  }

  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: "Guild not found.", ephemeral: true });

  // List of role IDs in promotion order
  const roles = [
    "1374391082648862852", // Freshman
    "1276560712336146442", // First Year
    "1276560813662142527", // Second Year
    "1276560867248439307", // Third Year
    "1276560973750206484"  // Fourth Year
  ];

  // Make sure all members are cached
  await guild.members.fetch();

  // Get the target argument from the slash command
  const target = interaction.options.getString('target');

  // Helper function to promote a member to the next year
  async function promoteMember(member) {
    for (let i = roles.length - 2; i >= 0; i--) {
      if (member.roles.cache.has(roles[i])) {
        await member.roles.remove(roles[i]);
        await member.roles.add(roles[i + 1]);
        return true;
      }
    }
    return false;
  }

  // Defer reply to avoid interaction timeout (if processing takes time)
  await interaction.deferReply();

  // Handle /promote all
  if (target.toLowerCase() === "all") {
    let count = 0;
    // Promote all members with promotable roles
    for (let i = roles.length - 2; i >= 0; i--) {
      const fromRole = guild.roles.cache.get(roles[i]);
      if (!fromRole) continue;
      for (const member of fromRole.members.values()) {
        if (await promoteMember(member)) count++;
      }
    }
    return interaction.editReply(`Promoted ${count} members.`);
  }

  // Handle /promote @user (mention)
  const mentionMatch = target.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    const userId = mentionMatch[1];
    const member = guild.members.cache.get(userId);
    if (!member) {
      return interaction.editReply({ content: "User not found.", ephemeral: true });
    }
    const promoted = await promoteMember(member);
    return interaction.editReply(
      promoted
        ? `Promoted ${member.user.tag}.`
        : `${member.user.tag} could not be promoted.`
    );
  }


  // Handle /promote <role> (by name, mention, or ID)
  const role = guild.roles.cache.find(r =>
    r.id === target.replace(/[<@&>]/g, "") ||
    r.name.toLowerCase() === target.toLowerCase()
  );
  if (role && roles.includes(role.id)) {
    let count = 0;
    for (const member of role.members.values()) {
      if (await promoteMember(member)) count++;
    }
    return interaction.editReply(`Promoted ${count} member(s) with role ${role.name}.`);
  }

  // If none of the above, reply with usage help
  return interaction.editReply({
    content: "Invalid argument. Use `all`, `@user`, or a role name/mention/ID.",
    ephemeral: true
  });
});

client.login(process.env.BOT_TOKEN);