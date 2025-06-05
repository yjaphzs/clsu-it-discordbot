/**
 * Facebook Graph API Helper Module
 *
 * This script handles Facebook Graph API authentication and token management
 * for fetching posts from the CLSU ITSC Facebook Page.
 * It is designed to be used by the CLSU IT Discord bot to retrieve and post
 * updates from the Facebook Page into the Discord server.
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Use built-in fetch in Node 18+, otherwise import node-fetch
const fetch: typeof globalThis.fetch = global.fetch
    ? global.fetch
    : require("node-fetch");

dotenv.config();

/**
 * Helper to get all configured Facebook pages from the environment.
 * Returns an array of page configs, one for each FB page.
 */
export function getFacebookPagesConfig() {
    const pageIndexes = (process.env.FB_PAGES || "1")
        .split(",")
        .map((s) => s.trim());
    return pageIndexes.map((idx) => ({
        index: idx,
        GRAPH_API_VERSION: process.env[`FB${idx}_GRAPH_API_VERSION`] as string,
        APP_ID: process.env[`FB${idx}_APP_ID`] as string,
        APP_SECRET: process.env[`FB${idx}_APP_SECRET`] as string,
        USER_ID: process.env[`FB${idx}_USER_ID`] as string,
        PAGE_ID: process.env[`FB${idx}_PAGE_ID`] as string,
        LONG_LIVED_TOKEN: process.env[
            `FB${idx}_LONG_LIVED_USER_TOKEN`
        ] as string,
        DISCORD_ANNOUNCEMENTS_WEBHOOK_URL: process.env[
            `FB${idx}_DISCORD_ANNOUNCEMENTS_WEBHOOK_URL`
        ] as string,
        DISCORD_EXAM_SCHEDULES_WEBHOOK_URL: process.env[
            `FB${idx}_DISCORD_EXAM_SCHEDULES_WEBHOOK_URL`
        ] as string,
        DISCORD_ACHIEVEMENTS_WEBHOOK_URL: process.env[
            `FB${idx}_DISCORD_ACHIEVEMENTS_WEBHOOK_URL`
        ] as string,
        DISCORD_EVENTS_WEBHOOK_URL: process.env[
            `FB${idx}_DISCORD_EVENTS_WEBHOOK_URL`
        ] as string,
        DISCORD_GENERAL_CHAT_WEBHOOK_URL: process.env[
            `FB${idx}_DISCORD_GENERAL_CHAT_WEBHOOK_URL`
        ] as string,
    }));
}

/**
 * Checks all FB pages in the environment for a SHORT_LIVED_USER_TOKEN (and no LONG_LIVED_USER_TOKEN),
 * exchanges it for a long-lived user token, updates the .env file, and removes the short-lived token.
 * Call this function on startup if you want to auto-upgrade tokens.
 */
export async function upgradeShortLivedTokensIfNeeded() {
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");
    let updated = false;

    const pages = getFacebookPagesConfig();
    for (const pageConfig of pages) {
        const shortTokenKey = `FB${pageConfig.index}_SHORT_LIVED_USER_TOKEN`;
        const longTokenKey = `FB${pageConfig.index}_LONG_LIVED_USER_TOKEN`;
        const shortToken = process.env[shortTokenKey];
        const longToken = process.env[longTokenKey];

        if (shortToken && !longToken) {
            // Exchange short-lived token for long-lived token
            const url =
                `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/oauth/access_token` +
                `?grant_type=fb_exchange_token` +
                `&client_id=${pageConfig.APP_ID}` +
                `&client_secret=${pageConfig.APP_SECRET}` +
                `&fb_exchange_token=${shortToken}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.access_token) {
                    // Update .env: set long-lived token, remove short-lived token
                    const longTokenRegex = new RegExp(
                        `${longTokenKey}=.*`,
                        "g"
                    );
                    const shortTokenRegex = new RegExp(
                        `${shortTokenKey}=.*`,
                        "g"
                    );
                    if (envContent.match(longTokenRegex)) {
                        envContent = envContent.replace(
                            longTokenRegex,
                            `${longTokenKey}=${data.access_token}`
                        );
                    } else {
                        envContent += `\n${longTokenKey}=${data.access_token}`;
                    }
                    // Remove the short-lived token line
                    envContent = envContent.replace(
                        shortTokenRegex,
                        `${shortTokenKey}=`
                    );
                    // Update process.env for immediate use
                    process.env[longTokenKey] = data.access_token;
                    process.env[shortTokenKey] = "";
                    updated = true;
                    console.log(
                        `Upgraded FB${pageConfig.index} short-lived token to long-lived token.`
                    );
                } else {
                    console.error(
                        `Failed to upgrade short-lived token for FB${pageConfig.index}:`,
                        data
                    );
                }
            } catch (err) {
                console.error(
                    `Error upgrading short-lived token for FB${pageConfig.index}:`,
                    err
                );
            }
        }
    }

    if (updated) {
        fs.writeFileSync(envPath, envContent, "utf8");
        console.log(".env file updated with new long-lived tokens.");
    }
}

// const FB_GRAPH_API_VERSION = process.env.FB_GRAPH_API_VERSION as string;
// const FB_APP_ID = process.env.FB_APP_ID as string;
// const FB_APP_SECRET = process.env.FB_APP_SECRET as string;
// const FB_USER_ID = process.env.FB_USER_ID as string;
// const FB_PAGE_ID = process.env.FB_PAGE_ID as string;
// const FB_LONG_LIVED_TOKEN = process.env.FB_LONG_LIVED_USER_TOKEN as string;

export interface FacebookPost {
    id: string;
    message?: string;
    permalink_url?: string;
    full_picture?: string;
    created_time?: string;
    attachments?: any;
    [key: string]: any;
}

/**
 * Refresh the Facebook long-lived user access token.
 * Returns the new token if successful, or null if failed.
 */
export async function refreshLongLivedUserToken(
    pageConfig: ReturnType<typeof getFacebookPagesConfig>[number]
): Promise<string | null> {
    const url =
        `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${pageConfig.APP_ID}` +
        `&client_secret=${pageConfig.APP_SECRET}` +
        `&fb_exchange_token=${pageConfig.LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.access_token) {
        console.log(
            `Refreshed long-lived user token for FB${pageConfig.index}:`,
            data.access_token
        );
        return data.access_token;
    } else {
        console.error(
            `Failed to refresh token for FB${pageConfig.index}:`,
            data
        );
        return null;
    }
}

/**
 * Get the page access token for the configured Facebook Page.
 * Returns the page access token if found, or null if not found.
 */
export async function getPageAccessToken(
    pageConfig: ReturnType<typeof getFacebookPagesConfig>[number]
): Promise<string | null> {
    const url = `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/${pageConfig.USER_ID}/accounts?access_token=${pageConfig.LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const page = data.data?.find((page: any) => page.id === pageConfig.PAGE_ID);
    if (page && page.access_token) {
        console.log(
            `Page Access Token for FB${pageConfig.index}:`,
            page.access_token
        );
        return page.access_token;
    } else {
        console.error(
            `Error: Page with the specified FB${pageConfig.index}_PAGE_ID not found or missing access_token.`
        );
        return null;
    }
}

/**
 * Update the FB_LONG_LIVED_USER_TOKEN in the .env file.
 * Overwrites the existing token line with the new token.
 */
export function updateEnvToken(newToken: string, pageIndex: string): void {
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = new RegExp(`FB${pageIndex}_LONG_LIVED_USER_TOKEN=.*`, "g");
    envContent = envContent.replace(
        regex,
        `FB${pageIndex}_LONG_LIVED_USER_TOKEN=${newToken}`
    );
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(
        `Updated .env with new long-lived user token for FB${pageIndex}.`
    );
}

/**
 * Update the FB_PAGE_ACCESS_TOKEN in the .env file.
 * Adds the line if it doesn't exist, or replaces it if it does.
 */
export function updateEnvPageToken(newPageToken: string): void {
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.match(/^FB_PAGE_ACCESS_TOKEN=.*$/m)) {
        envContent = envContent.replace(
            /^FB_PAGE_ACCESS_TOKEN=.*$/m,
            `FB_PAGE_ACCESS_TOKEN=${newPageToken}`
        );
    } else {
        envContent += `\nFB_PAGE_ACCESS_TOKEN=${newPageToken}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("Updated .env with new page access token.");
}

/**
 * Fetch the latest posts from the configured Facebook Page.
 * Returns an array of post objects or null if an error occurs.
 */
export async function getFacebookPagePosts(
    pageConfig: ReturnType<typeof getFacebookPagesConfig>[number],
    limit = 10
): Promise<FacebookPost[] | null> {
    if (!pageConfig.PAGE_ID) {
        console.error(`FB${pageConfig.index}_PAGE_ID is missing in .env`);
        return null;
    }

    const pageAccessToken = await getPageAccessToken(pageConfig);
    if (!pageAccessToken) {
        console.error(
            `Failed to retrieve Page Access Token for FB${pageConfig.index}.`
        );
        return null;
    }

    const fields =
        "id,child_attachments,message,full_picture,attachments{media,target},permalink_url,properties,created_time,is_published,status_type";
    const url = `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/${pageConfig.PAGE_ID}/posts?fields=${fields}&access_token=${pageAccessToken}&limit=${limit}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error(
                `Error fetching Facebook posts for FB${pageConfig.index}:`,
                data.error
            );
            return null;
        }

        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(now.getDate() - 7);

        const postsWithAttachments = (data.data || []).filter(
            (post: FacebookPost) =>
                post.attachments &&
                post.attachments.data &&
                new Date(post.created_time!) >= fiveDaysAgo
        );

        postsWithAttachments.sort(
            (a: FacebookPost, b: FacebookPost) =>
                new Date(a.created_time!).getTime() -
                new Date(b.created_time!).getTime()
        );

        return postsWithAttachments;
    } catch (err) {
        console.error(`Fetch error for FB${pageConfig.index}:`, err);
        return null;
    }
}
