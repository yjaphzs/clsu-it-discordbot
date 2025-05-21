![server-bannerlong](https://github.com/user-attachments/assets/7b6cce34-afac-416f-ac27-9214e761f380)

# CLSU IT Discord Role Promotion Bot

A Discord bot for the CLSU IT community that helps moderators and admins promote users’ year-level roles efficiently.  
Supports both legacy message commands and modern slash commands for promoting all users, specific users, or users with a specified role.

---

## Features

- **Promote all users:**  
  `/promote all` or `!promote all`
- **Promote a specific user:**  
  `/promote @user` or `!promote @user`
- **Promote by role:**  
  `/promote <role>` or `!promote <role>`
- **Permission checks:**  
  Only server administrators (or optionally, moderators) can use the promote commands.
- **Uses role IDs:**  
  Reliable and not affected by role name changes.

---

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/clsu-it-discord-bot.git
   cd clsu-it-discord-bot
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the project root:
     ```
     BOT_TOKEN=your-bot-token-here
     CLIENT_ID=your-bot-client-id
     SERVER_ID=your-server-id
     ```
   - Get your bot token and IDs from the [Discord Developer Portal](https://discord.com/developers/applications).

4. **Register the slash command:**
   ```sh
   node register-commands.js
   ```
   Run this whenever you update your slash commands.

5. **Start the bot:**
   ```sh
   node index.js
   ```

---

## Usage

- Use `/promote` in Discord to see the command and its options.
- You can also use the legacy `!promote` message command if enabled in the code.

### Example commands

- `/promote all` — Promote all users to the next year level.
- `/promote @username` — Promote a specific user.
- `/promote First Year` — Promote all users with the "First Year" role.

---

## Permissions

- The bot requires the **Manage Roles** permission.
- The bot’s highest role must be above the roles it needs to manage in the server’s role list.
- By default, only administrators can use the promote commands. You can adjust this in the code to allow moderators.

---

## Customization

- **Role IDs:**  
  Update the `roles` array in `index.js` to match your server’s year-level role IDs.
- **Moderator access:**  
  Change the permission check in `index.js` if you want to allow moderators instead of just admins.

---
