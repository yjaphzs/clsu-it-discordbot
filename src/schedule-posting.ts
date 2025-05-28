import { getPostedIds, savePostedId } from "./utils";
import { getFacebookPagePosts } from "./facebook-api";
import {
    composeDiscordWebhookMessage,
    sendDiscordWebhookMessage,
} from "./discord-webhook";

/**
 * Detects if a post message is about an examination schedule.
 */
export function isExamSchedulePost(message: string): boolean {
    if (!message) return false;

    // Normalize for easier matching
    const lower = message.toLowerCase();

    // Keywords and patterns to match
    const examKeywords = [
        "exam schedule",
        "examination schedule",
        "final exam",
        "finals mode",
        "midterm exam",
        "midterms mode",
        "examination week",
        "exam alert",
        "examinations are set",
        "exam schedule here",
        "full exam schedule",
        "exam sched",
        "test schedule",
        "final exams are scheduled",
        "midterm exams are happening",
        "first term examinations",
        "second term examinations",
        "midterm examinations",
        "final examinations",
        "first term examination",
        "second term examination",
        "midterm examination",
        "final examination",
        "exam dates",
        "exam period",
        "exam week",
        "good luck, bsit fam",
        "review well",
    ];

    // If any keyword is present, it's likely an exam schedule post
    for (const keyword of examKeywords) {
        if (lower.includes(keyword)) return true;
    }

    // Also match for date patterns commonly used in exam posts
    const datePattern =
        /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}/i;
    if (datePattern.test(message)) return true;

    // Match for "exam" and "schedule" in the same sentence
    if (lower.includes("exam") && lower.includes("schedule")) return true;

    return false;
}

/**
 * Runs the Facebook-to-Discord posting logic every hour,
 * but only between 6:00am and 10:00pm server time.
 */
export function scheduleFacebookToDiscordPosting() {
    // Announcements Channel Webhook URL
    const announcementsWebhookUrl = process.env
        .DISCORD_ANNOUNCEMENTS_WEBHOOK_URL as string;

    // Exam Schedules Channel Webhook URL
    const examSchedulesWebhookUrl = process.env
        .DISCORD_EXAM_SCHEDULES_WEBHOOK_URL as string;

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

                    // Compose the Discord webhook message payload
                    const payload = await composeDiscordWebhookMessage(post);

                    // Send the post to the announcements channel
                    await sendDiscordWebhookMessage(
                        announcementsWebhookUrl,
                        payload
                    );

                    // Check if the post message is about an exam schedule
                    // and send to the exam schedules channel if it is
                    if (
                        post.message &&
                        typeof post.message === "string" &&
                        isExamSchedulePost(post.message)
                    ) {
                        await sendDiscordWebhookMessage(
                            examSchedulesWebhookUrl,
                            payload
                        );
                    }

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
