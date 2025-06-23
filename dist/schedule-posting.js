"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventPost = isEventPost;
exports.isAchievementPost = isAchievementPost;
exports.isExamSchedulePost = isExamSchedulePost;
exports.isBirthdayPost = isBirthdayPost;
exports.scheduleFacebookToDiscordPosting = scheduleFacebookToDiscordPosting;
const utils_1 = require("./utils");
const facebook_api_1 = require("./facebook-api");
const discord_webhook_1 = require("./discord-webhook");
const discord_js_1 = require("discord.js");
function normalizeText(text) {
    // Remove diacritics and convert stylized Unicode to ASCII where possible
    return text
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1d400}-\u{1d7ff}]/gu, (c) => String.fromCharCode(c.charCodeAt(0) - 0x1d400 + 0x41))
        .replace(/[^\x00-\x7F]/g, "") // Remove any remaining non-ASCII
        .toLowerCase();
}
/**
 * Detects if a post message is about an event (tournament, seminar, contest, workshop, etc.)
 */
function isEventPost(message) {
    if (!message)
        return false;
    const lower = normalizeText(message);
    const sentences = lower.split(/[.!?]/);
    for (const sentence of sentences) {
        // Check if the sentence contains keywords related to announcements
        if ((sentence.includes("adviser") ||
            sentence.includes("advisers") ||
            sentence.includes("advisor") ||
            sentence.includes("advisors")) &&
            (sentence.includes("meet") || sentence.includes("the new"))) {
            return false;
        }
        if (sentence.includes("submit") ||
            sentence.includes("submission") ||
            (sentence.includes("gathering names") &&
                (sentence.includes("scholar") || sentence.includes("achiever")))) {
            return false;
        }
    }
    // Common event-related keywords and phrases
    const eventKeywords = [
        "event",
        "keynote",
        "session",
        "talk",
        "panel",
        "conference room",
        "tournament",
        "match schedule",
        "match lineup",
        "bracket",
        "competition",
        "contest",
        "seminar",
        "webinar",
        "workshop",
        "conference",
        "ceremony",
        "fair",
        "registration",
        "register now",
        "register here",
        "sign up",
        "join us",
        "join now",
        "slots remaining",
        "open to all",
        "open for registration",
        "deadline",
        "submission deadline",
        "mechanics",
        "guidelines",
        "how to join",
        "how to submit",
        "see you there",
        "where:",
        "when:",
        "date:",
        "venue:",
        "location:",
        "live on",
        "via discord",
        "via facebook",
        "via zoom",
        "present(s):",
        "presents:",
        "invites you",
        "invitation",
        "hosted by",
        "organized by",
        "brought to you by",
        "battlefield is set",
        "let the games begin",
        "let the competition begin",
        "let the contest begin",
        "let the tournament begin",
        "let the challenge begin",
        "slots are limited",
        "first-come, first-served",
        "teams of",
        "team registration",
        "entry fee",
        "prize pool",
        "prizes await",
        "showcase",
        "featured speakers",
        "featured topics",
        "topic:",
        "topics:",
        "speaker:",
        "speakers:",
        "see you there",
        "see you at",
        "see you, it peeps",
        "intrams",
        "intramurals",
        "sportsfest",
        "#itweek",
        "#itsportsfest",
        "#ignite2025",
        "#studentweek",
        "#univweek",
        "#universityweek",
        "#sikad",
        "#uweek",
        "colloquium",
        "research colloquium",
        "capstone presentation",
        "panel session",
        "guest panel",
        "conference room",
        "presentation of projects",
        "celebration of",
    ];
    for (const keyword of eventKeywords) {
        if (lower.includes(keyword))
            return true;
    }
    // Also match for date/time/location patterns
    const datePattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}/i;
    const timePattern = /\b\d{1,2}:\d{2}\s*(am|pm)?\b/i;
    const locationPattern = /\b(where|venue|location):/i;
    if (datePattern.test(message) ||
        timePattern.test(message) ||
        locationPattern.test(message)) {
        return true;
    }
    // Match for "present(s):" or "presents:" followed by an activity name
    const presentsPattern = /\bpresent(s)?:\s*\w+/i;
    if (presentsPattern.test(message))
        return true;
    return false;
}
/**
 * Detects if a post message is about an achievement:
 * - Graduation
 * - Scholars
 * - Newly elected officers
 * - Competition winners (champion, runner-up, etc.)
 */
function isAchievementPost(message) {
    if (!message)
        return false;
    const lower = normalizeText(message);
    // Exclude generic photo recaps from achievements
    if ((lower.startsWith("in photo") || lower.startsWith("in photos")) &&
        !/(best|award|winner|champion|presenter|poster|paper|recognition|congratulations|congrats)/.test(lower)) {
        return false;
    }
    const sentences = lower.split(/[.!?]/);
    for (const sentence of sentences) {
        // Check if the sentence contains keywords related to announcements
        if (sentence.includes("submit") ||
            sentence.includes("submission") ||
            (sentence.includes("gathering names") &&
                (sentence.includes("scholar") || sentence.includes("achiever")))) {
            return false;
        }
    }
    // Keywords for achievements
    const achievementKeywords = [
        "congratulations",
        "congrats",
        "proudly congratulate",
        "proudly congratulates",
        "cheers to the graduates",
        "raise your bottles",
        "cheers to the mid-year graduates",
        "academic distinction",
        "cum laude",
        "magna cum laude",
        "summa cum laude",
        "university scholar",
        "college scholar",
        "dean lister",
        "dean's lister",
        "dean’s lister",
        "dean listers",
        "dean's listers",
        "dean’s listers",
        "scholars for the",
        "scholars of the",
        "you nailed it",
        "you nailed it!",
        "bags",
        "champion",
        "runner-up",
        "winner",
        "winners",
        "secured",
        "placed",
        "placing",
        "brought home",
        "brought pride",
        "elected",
        "newly elected",
        "officer",
        "officers",
        "representative",
        "first year representative",
        "student council",
        "has emerged as",
        "has proven",
        "has achieved",
        "has been awarded",
        "has been recognized",
        "has been named",
        "has been selected",
        "has been chosen",
        "has been appointed",
        "has been promoted",
        "top performer",
        "top performers",
        "topnotcher",
        "topnotchers",
        "awardee",
        "awardees",
        "honoree",
        "honorees",
        "distinction",
        "excellence",
        "outstanding",
        "best presenter",
        "best capstone",
        "best paper",
        "best poster",
        "award",
        "awarded",
        "recognition",
        "best in",
        "best paper",
        "best project",
        "best thesis",
        "best capstone",
        "best presentation",
        "best poster",
        "best speaker",
        "best debater",
        "best programmer",
        "best designer",
        "best leader",
        "best innovator",
        "best researcher",
        "best developer",
        "best team",
        "best group",
        "best class",
        "best section",
        "best adviser",
        "best coach",
        "best mentor",
        "best faculty",
        "best staff",
        "best student",
        "best teacher",
        "best professor",
        "best instructor",
        "best employee",
        "best worker",
        "best volunteer",
        "best organizer",
        "best participant",
        "best attendee",
        "best supporter",
        "best contributor",
        "best donor",
        "best sponsor",
        "best partner",
        "best collaborator",
        "best friend",
        "best ally",
        "best advocate",
        "best ambassador",
        "best representative",
        "best delegate",
        "best envoy",
        "best emissary",
        "best diplomat",
        "best negotiator",
        "best mediator",
        "best arbitrator",
        "best conciliator",
        "best peacemaker",
        "best peacekeeper",
        "best peacebuilder",
        "best peace advocate",
        "best peace ambassador",
        "best peace representative",
        "best peace delegate",
        "best peace envoy",
        "best peace emissary",
        "best peace diplomat",
        "best peace negotiator",
        "best peace mediator",
        "best peace arbitrator",
        "best peace conciliator",
        "best peace peacemaker",
        "best peace peacekeeper",
        "best peace peacebuilder",
        "best peace peace advocate",
        "best peace peace ambassador",
        "best peace peace representative",
        "best peace peace delegate",
        "best peace peace envoy",
        "best peace peace emissary",
        "best peace peace diplomat",
        "best peace peace negotiator",
        "best peace peace mediator",
        "best peace peace arbitrator",
        "best peace peace conciliator",
        "participate",
        "participated",
        "onboarding",
        "leadership camp",
        "innovation",
        "training",
        "attended",
    ];
    // If any keyword is present, it's likely an achievement post
    for (const keyword of achievementKeywords) {
        if (lower.includes(keyword))
            return true;
    }
    // Also match for patterns like "bags 1st place", "secures 2nd runner-up", etc.
    const achievementPattern = /\b(bags|secures?|wins?|places?|awarded|recognized|elected|appointed|chosen|selected|named)\b.*\b(champion|runner[- ]?up|winner|award|place|distinction|scholar|officer|representative|honoree|topnotcher|top performer)\b/i;
    if (achievementPattern.test(message))
        return true;
    // Graduation pattern
    if (lower.includes("graduate") &&
        (lower.includes("congrat") ||
            lower.includes("cheers") ||
            lower.includes("proudly")))
        return true;
    return false;
}
/**
 * Detects if a post message is about an examination schedule.
 */
function isExamSchedulePost(message) {
    if (!message)
        return false;
    // Normalize for easier matching
    const lower = normalizeText(message);
    const sentences = lower.split(/[.!?]/);
    for (const sentence of sentences) {
        // Check if the sentence contains keywords related to announcements
        if (sentence.includes("submit") ||
            sentence.includes("submission") ||
            (sentence.includes("gathering names") &&
                (sentence.includes("scholar") || sentence.includes("achiever")))) {
            return false;
        }
    }
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
 * Detects if a post message is about a birthday greeting.
 */
function isBirthdayPost(message) {
    if (!message)
        return false;
    const lower = normalizeText(message);
    const sentences = lower.split(/[.!?]/);
    for (const sentence of sentences) {
        // Check if the sentence contains keywords related to announcements
        if (sentence.includes("submit") ||
            sentence.includes("submission") ||
            (sentence.includes("gathering names") &&
                (sentence.includes("scholar") || sentence.includes("achiever")))) {
            return false;
        }
    }
    // Common birthday keywords and phrases
    const birthdayKeywords = [
        "happy birthday",
        "happiest birthday",
        "bright-filled birthday",
        "delightful birthday",
        "warmest birthday",
        "birthday greetings",
        "birthday to you",
        "celebrate your birthday",
        "celebrate the birthday",
        "special day",
        "have a wonderful birthday",
        "have the warmest birthday",
        "have the happiest birthday",
        "again, happy birthday",
        "again, happiest birthday",
        "birthday wishes",
        "birthday,",
        "birthday!",
    ];
    // If any keyword is present, it's likely a birthday post
    for (const keyword of birthdayKeywords) {
        if (lower.includes(keyword))
            return true;
    }
    // Also match for "birthday" and a name in the same sentence
    const birthdayPattern = /\b(happy|happiest|bright-filled|delightful|warmest)?\s*birthday\b/i;
    if (birthdayPattern.test(message))
        return true;
    return false;
}
/**
 * Runs the Facebook-to-Discord posting logic every hour,
 * but only between 6:00am and 10:00pm server time.
 */
function scheduleFacebookToDiscordPosting(client) {
    (0, facebook_api_1.upgradeShortLivedTokensIfNeeded)();
    async function runIfWithinTime() {
        console.log("Running Facebook to Discord posting logic...");
        const now = new Date();
        const hour = now.toLocaleString("en-US", {
            hour: "2-digit",
            hour12: false,
            timeZone: "Asia/Manila",
        });
        console.log(`Current Manila hour: ${hour}`);
        // Only run between 6:00 (6am) and 24:00 (12pm)
        if (parseInt(hour) >= 6 && parseInt(hour) < 24) {
            let postedIds = (0, utils_1.getPostedIds)();
            // Loop through all configured Facebook pages
            const pages = (0, facebook_api_1.getFacebookPagesConfig)();
            for (const pageConfig of pages) {
                const posts = await (0, facebook_api_1.getFacebookPagePosts)(pageConfig, 30);
                if (posts) {
                    for (const post of posts) {
                        if (postedIds.includes(post.id))
                            continue;
                        // Compose the Discord webhook message payload
                        const payload = await (0, discord_webhook_1.composeDiscordWebhookMessage)(post);
                        if (post.message && typeof post.message === "string") {
                            // Check if the post message is about an achievement
                            // and send to the achievements channel if it is
                            if (isAchievementPost(post.message)) {
                                await (0, discord_webhook_1.sendDiscordWebhookMessage)(pageConfig.DISCORD_ACHIEVEMENTS_WEBHOOK_URL, payload);
                            }
                            // Check if the post message is about an event
                            // and send to the events channel if it is
                            else if (isEventPost(post.message)) {
                                await (0, discord_webhook_1.sendDiscordWebhookMessage)(pageConfig.DISCORD_EVENTS_WEBHOOK_URL, payload);
                            }
                            // Check if the post message is about an exam schedule
                            // and send to the exam schedules channel if it is
                            else if (isExamSchedulePost(post.message)) {
                                await (0, discord_webhook_1.sendDiscordWebhookMessage)(pageConfig.DISCORD_EXAM_SCHEDULES_WEBHOOK_URL, payload);
                            }
                            // Check if the post message is about a birthday
                            // and send to the general chat channel if it is
                            else if (isBirthdayPost(post.message)) {
                                await (0, discord_webhook_1.sendDiscordWebhookMessage)(pageConfig.DISCORD_GENERAL_CHAT_WEBHOOK_URL, payload);
                                // Image path for the birthday embed
                                const imagePath = require("path").join(__dirname, "images", "happy-birthday.jpg");
                                // Create an attachment for the birthday image
                                const attachment = new discord_js_1.AttachmentBuilder(imagePath);
                                // Create the birthday embed message
                                const birthdayEmbed = new discord_js_1.EmbedBuilder()
                                    .setTitle("Birthday Alert! 🎉")
                                    .setDescription("Let us wish them a happy birthday!\n\n" +
                                    "May your day be filled with joy, laughter, and all the things that make you happiest. " +
                                    "The whole IT community celebrates with you today! 🎂🥳")
                                    .setImage("attachment://happy-birthday.jpg")
                                    .setColor("#3eea8b");
                                // Fetch the general chat channel
                                const channelId = process.env
                                    .GENERAL_CHAT_CHANNEL_ID;
                                const channel = await client.channels.fetch(channelId);
                                // If the channel exists and is text-based, send the birthday embed
                                if (channel &&
                                    channel.isTextBased() &&
                                    "send" in channel) {
                                    await channel.send({
                                        embeds: [birthdayEmbed],
                                        files: [attachment],
                                    });
                                }
                            }
                            // If it's not an achievement, event, exam schedule, or birthday post,
                            // send it to the announcements channel
                            else {
                                await (0, discord_webhook_1.sendDiscordWebhookMessage)(pageConfig.DISCORD_ANNOUNCEMENTS_WEBHOOK_URL, payload);
                            }
                        }
                        (0, utils_1.savePostedId)(post.id);
                        postedIds = (0, utils_1.getPostedIds)();
                    }
                }
                else {
                    console.error(`No posts found or an error occurred for FB${pageConfig.index}.`);
                }
            }
            console.log("Successfully posted new Facebook posts to Discord channels.");
        }
        else {
            console.log("Current time is outside the posting window (6:00am - 12:00pm). Skipping execution.");
        }
    }
    // Run immediately on startup
    runIfWithinTime();
    // Then run every 20 minutes
    setInterval(runIfWithinTime, 20 * 60 * 1000);
}
