![server-bannerlong](https://github.com/user-attachments/assets/7b6cce34-afac-416f-ac27-9214e761f380)

# CLSU IT Discord Bot

A feature-rich Discord bot for the **Central Luzon State University (CLSU) IT** community.  
Built with **TypeScript**, this bot automates role promotions, Facebook event/achievement posting, graduation reactions, and more—streamlining server management and boosting community engagement for IT moderators, admins, and students.

![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

## CLSU IT Discord Server

![image](https://github.com/user-attachments/assets/a932af07-a065-46a0-8328-787626a089a0)

## Features

- **Role Promotion**
  - Promote all users to the next year level
  - Promote a specific user
  - Promote by role (e.g., all 1st years)
  - Supports both legacy message commands (with prefix) and modern slash commands
 
- **Year Level Member Stats**
  - View the number of members per year level
  - List all members in each year level

- **Congratulate Graduates with Reaction Role**
  - Congratulate all Fourth Year members
  - Graduates can react to a message to trade their 4th Year role for the Alumni role

- **Automated Facebook to Discord Posting**
  - Automatically fetches posts from the official Facebook page
  - Detects and posts:
    - Achievements (scholars, graduates, winners, etc.)
    - Events (tournaments, seminars, workshops, etc.)
    - Exam schedules
    - Birthdays
  - Sends posts to the appropriate Discord channels via webhooks

## Commands

### Slash Commands

| Command                     | Description                                                                                   |
|-----------------------------|-----------------------------------------------------------------------------------------------|
| `/promote`                  | Promote users by year, user, or role. Usage: `/promote all`, `/promote @user`, `/promote <role>` |
| `/year-level-member-stats`  | List all members per year level                                                               |
| `/congratulate-graduates`   | Congratulate all Fourth Year members and start the alumni role process                        |

### Message Commands (with prefix)

| Command                              | Description                                                                                   |
|---------------------------------------|-----------------------------------------------------------------------------------------------|
| `it!promote all`                      | Promote everyone to the next year level                                                       |
| `it!promote @user`                    | Promote a specific user                                                                       |
| `it!promote <role>`                   | Promote all members of a specific year level                                                  |
| `it!year-level-member-stats`          | List all members per year level                                                               |
| `it!congratulate-graduates`           | Congratulate all Fourth Year members and start the alumni role process                        |

> Only users with **Administrator** permission can use the promote and management commands.

## Facebook to Discord Posting

- Automatically runs on bot startup and at scheduled intervals (6AM–10PM)
- Posts are classified and sent to:
  - **Achievements Channel**
  - **Events Channel**
  - **Exam Schedules Channel**
  - **Birthdays Channel**

## Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-org/clsu-it-discordbot.git
   cd clsu-it-discordbot
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your credentials and IDs.
   ```env
   # DISCORD APP
   APP_ID=
   PUBLIC_KEY=
   SERVER_ID=
   BOT_TOKEN=
   CLIENT_ID=
   CLIENT_SECRET=
  
   # DISCORD SERVER WEBHOOKS
   DISCORD_ANNOUNCEMENTS_WEBHOOK_URL=
   DISCORD_EXAM_SCHEDULES_WEBHOOK_URL=
   DISCORD_ACHIEVEMENTS_WEBHOOK_URL=
   DISCORD_GENERAL_CHAT_WEBHOOK_URL=
   DISCORD_EVENTS_WEBHOOK_URL=
  
   # DISCORD SERVER ROLES
   FRESHMAN_ROLE_ID=
   FIRST_YEAR_ROLE_ID=
   SECOND_YEAR_ROLE_ID=
   THIRD_YEAR_ROLE_ID=
   FOURTH_YEAR_ROLE_ID=
   ALUMNI_ROLE_ID=
   UNVERIFIED_ROLE_ID=
   INTRODUCED_ROLE_ID=
  
   # DISCORD SERVER CHANNELS
   FIRST_YEAR_CHANNEL_ID=
   SECOND_YEAR_CHANNEL_ID=
   THIRD_YEAR_CHANNEL_ID=
   FOURTH_YEAR_CHANNEL_ID=
  
   # FACEBOOK GRAPH API
   FB_APP_ID=
   FB_APP_SECRET=
   FB_PAGE_ID=
   FB_USER_ID=
   FB_GRAPH_API_VERSION=
   FB_LONG_LIVED_USER_TOKEN=
   ```

4. **Run the bot**
   ```sh
   npm start
   ```

## Folder Structure

- `src/`
  - `index.ts` — Main entry point
  - `slash-commands.ts` — Slash command logic
  - `message-commands.ts` — Legacy message command logic
  - `schedule-posting.ts` — Facebook to Discord posting logic
  - `register-commands.ts` — Slash command registration script
  - `utils.ts`, `facebook-api.ts`, `discord-webhook.ts` — Helpers

## Screenshots

### Automated Facebook to Discord Posting

![image](https://github.com/user-attachments/assets/46131482-d75e-4b4a-be1f-1fde167b0195)

### Year Level Member Stats

![image](https://github.com/user-attachments/assets/ccee0e26-6609-452e-89b8-24dc1b08f7f2)

### Congratulate Graduates with Reaction Role

![image](https://github.com/user-attachments/assets/f0be84c8-bb4f-4765-bc18-c0411c62d669)

## Contributing

Pull requests and suggestions are welcome!  
Please open an issue first to discuss what you would like to change.

## License

MIT

**Developed by Jan Bautista for the CLSU IT Community**
