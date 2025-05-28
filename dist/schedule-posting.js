"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExamSchedulePost = isExamSchedulePost;
exports.scheduleFacebookToDiscordPosting = scheduleFacebookToDiscordPosting;
const utils_1 = require("./utils");
const facebook_api_1 = require("./facebook-api");
const discord_webhook_1 = require("./discord-webhook");
/**
 * Detects if a post message is about an examination schedule.
 */
function isExamSchedulePost(message) {
    if (!message)
        return false;
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
        if (lower.includes(keyword))
            return true;
    }
    // Also match for date patterns commonly used in exam posts
    const datePattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}/i;
    if (datePattern.test(message))
        return true;
    // Match for "exam" and "schedule" in the same sentence
    if (lower.includes("exam") && lower.includes("schedule"))
        return true;
    return false;
}
/**
 * Runs the Facebook-to-Discord posting logic every hour,
 * but only between 6:00am and 10:00pm server time.
 */
function scheduleFacebookToDiscordPosting() {
    // Announcements Channel Webhook URL
    const announcementsWebhookUrl = process.env
        .DISCORD_ANNOUNCEMENTS_WEBHOOK_URL;
    // Exam Schedules Channel Webhook URL
    const examSchedulesWebhookUrl = process.env
        .DISCORD_EXAM_SCHEDULES_WEBHOOK_URL;
    async function runIfWithinTime() {
        const now = new Date();
        const hour = now.getHours();
        // Only run between 6:00 (6am) and 22:00 (10pm)
        if (hour >= 6 && hour < 22) {
            let postedIds = (0, utils_1.getPostedIds)();
            const posts = await (0, facebook_api_1.getFacebookPagePosts)(30);
            if (posts) {
                for (const post of posts) {
                    if (postedIds.includes(post.id))
                        continue;
                    // Compose the Discord webhook message payload
                    const payload = await (0, discord_webhook_1.composeDiscordWebhookMessage)(post);
                    // Send the post to the announcements channel
                    await (0, discord_webhook_1.sendDiscordWebhookMessage)(announcementsWebhookUrl, payload);
                    // Check if the post message is about an exam schedule
                    // and send to the exam schedules channel if it is
                    if (post.message &&
                        typeof post.message === "string" &&
                        isExamSchedulePost(post.message)) {
                        await (0, discord_webhook_1.sendDiscordWebhookMessage)(examSchedulesWebhookUrl, payload);
                    }
                    (0, utils_1.savePostedId)(post.id);
                    postedIds = (0, utils_1.getPostedIds)();
                }
            }
        }
    }
    // Run immediately on startup
    runIfWithinTime();
    // Then run every 20 minutes
    setInterval(runIfWithinTime, 20 * 60 * 1000);
}
