![server-bannerlong](https://github.com/user-attachments/assets/7b6cce34-afac-416f-ac27-9214e761f380)

# CLSU IT Discord Bot

A feature-rich Discord bot for the Central Luzon State University (CLSU) IT community.  
This bot automates role promotions, event/achievement posting, and more—making server management and community engagement easier for IT moderators, admins, and students.

---

## Features

- **Role Promotion**
  - Promote all users to the next year level
  - Promote a specific user
  - Promote by role (e.g., all 1st years)
  - Supports both legacy message commands (with prefix) and modern slash commands

- **Automated Facebook to Discord Posting**
  - Automatically fetches posts from the official Facebook page
  - Detects and posts:
    - Achievements (scholars, graduates, winners, etc.)
    - Events (tournaments, seminars, workshops, etc.)
    - Exam schedules
    - Birthdays
  - Sends posts to the appropriate Discord channels via webhooks

- **Event & Achievement Detection**
  - Uses keyword and pattern matching to classify posts
  - Customizable for your community’s needs

- **Birthday Greetings**
  - Detects and highlights birthday posts

---

## Commands

### Slash Commands

| Command                     | Description                                                                                   |
|-----------------------------|-----------------------------------------------------------------------------------------------|
| `/promote`                  | Promote users by year, user, or role. Usage: `/promote all`, `/promote @user`, `/promote <role>` |
| `/year-level-member-stats`  | List all members per year level                                                               |
| `/congratulate-graduates`   | Congratulate all Fourth Year members and start the alumni role process                        |
| `/fresh-start`              | Send a fresh start message to all year-level channels                                         |
| `/reset-year-roles`         | Remove all year-level roles from all members                                                  |
| `/manual-facebook-post`     | Manually post a Facebook post to Discord by post ID                                           |

### Message Commands (with prefix)

| Command                              | Description                                                                                   |
|---------------------------------------|-----------------------------------------------------------------------------------------------|
| `it!promote all`                      | Promote everyone to the next year level                                                       |
| `it!promote @user`                    | Promote a specific user                                                                       |
| `it!promote <role>`                   | Promote all members of a specific year level                                                  |
| `it!year-level-member-stats`          | List all members per year level                                                               |
| `it!congratulate-graduates`           | Congratulate all Fourth Year members and start the alumni role process                        |
| `it!fresh-start`                      | Send a fresh start message to all year-level channels                                         |
| `it!reset-year-roles`                 | Remove all year-level roles from all members                                                  |
| `it!manual-facebook-post <post_id>`   | Manually post a Facebook post to Discord by post ID                                           |

> Only users with **Administrator** permission can use the promote and management commands.

---

## Facebook to Discord Posting

- Automatically runs on bot startup and at scheduled intervals (6AM–10PM)
- Posts are classified and sent to:
  - **Achievements Channel**
  - **Events Channel**
  - **Exam Schedules Channel**
  - **Birthdays Channel**

---

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

---

## Folder Structure

- `src/`
  - `index.ts` — Main entry point
  - `slash-commands.ts` — Slash command logic
  - `message-commands.ts` — Legacy message command logic
  - `schedule-posting.ts` — Facebook to Discord posting logic
  - `register-commands.ts` — Slash command registration script
  - `utils.ts`, `facebook-api.ts`, `discord-webhook.ts` — Helpers

---

## Contributing

Pull requests and suggestions are welcome!  
Please open an issue first to discuss what you would like to change.

---

## License

MIT

---

**Developed by Jan Bautista for the CLSU IT Community**
