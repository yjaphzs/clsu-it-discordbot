![server-bannerlong](https://github.com/user-attachments/assets/7b6cce34-afac-416f-ac27-9214e761f380)

# CLSU IT Discord Bot

A feature-rich Discord bot for the **Central Luzon State University (CLSU) IT** community.  
Built with **TypeScript**, this bot automates role promotions, Facebook event/achievement posting, graduation reactions, and more—streamlining server management and boosting community engagement for IT moderators, admins, and students.

![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

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

   Create a `.env` file with:
   ```
   BOT_TOKEN=your_discord_bot_token
   FACEBOOK_PAGE_ACCESS_TOKEN=your_facebook_token
   CLIENT_ID=your_discord_client_id
   SERVER_ID=your_discord_server_id
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

---

## Screenshots

### Slash Commands

![image](https://github.com/user-attachments/assets/24dc4db0-cb95-458f-931a-31fc2d3aa40f)

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
