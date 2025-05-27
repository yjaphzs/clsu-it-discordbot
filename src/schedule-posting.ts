import { getPostedIds, savePostedId } from "./utils";
import { getFacebookPagePosts } from "./facebook-api";
import {
    composeDiscordWebhookMessage,
    sendDiscordWebhookMessage,
} from "./discord-webhook";

/**
 * Runs the Facebook-to-Discord posting logic every hour,
 * but only between 6:00am and 10:00pm server time.
 */
export function scheduleFacebookToDiscordPosting() {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL as string;

    async function runIfWithinTime() {
        const now = new Date();
        const hour = now.getHours();
        // Only run between 6:00 (6am) and 22:00 (10pm)
        if (hour >= 6 && hour < 22) {
            let postedIds = getPostedIds();
            const posts = await getFacebookPagePosts(30);
            if (posts) {
                for (const post of posts) {
                    if (postedIds.includes(post.id)) continue;
                    const payload = await composeDiscordWebhookMessage(post);
                    await sendDiscordWebhookMessage(webhookUrl, payload);
                    savePostedId(post.id);
                    postedIds = getPostedIds();
                }
            }
        }
    }

    // Run immediately on startup
    runIfWithinTime();

    // Then run every 20 minutes
    setInterval(runIfWithinTime, 20 * 60 * 1000);
}
