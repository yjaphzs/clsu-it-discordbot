"use strict";
/**
 * Facebook Graph API Helper Module
 *
 * This script handles Facebook Graph API authentication and token management
 * for fetching posts from the CLSU ITSC Facebook Page.
 * It is designed to be used by the CLSU IT Discord bot to retrieve and post
 * updates from the Facebook Page into the Discord server.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFacebookPagesConfig = getFacebookPagesConfig;
exports.upgradeShortLivedTokensIfNeeded = upgradeShortLivedTokensIfNeeded;
exports.refreshLongLivedUserToken = refreshLongLivedUserToken;
exports.getPageAccessToken = getPageAccessToken;
exports.updateEnvToken = updateEnvToken;
exports.updateEnvPageToken = updateEnvPageToken;
exports.getFacebookPagePosts = getFacebookPagePosts;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Use built-in fetch in Node 18+, otherwise import node-fetch
const fetch = global.fetch
    ? global.fetch
    : require("node-fetch");
dotenv.config();
/**
 * Helper to get all configured Facebook pages from the environment.
 * Returns an array of page configs, one for each FB page.
 */
function getFacebookPagesConfig() {
    const pageIndexes = (process.env.FB_PAGES || "1")
        .split(",")
        .map((s) => s.trim());
    return pageIndexes.map((idx) => ({
        index: idx,
        GRAPH_API_VERSION: process.env[`FB${idx}_GRAPH_API_VERSION`],
        APP_ID: process.env[`FB${idx}_APP_ID`],
        APP_SECRET: process.env[`FB${idx}_APP_SECRET`],
        USER_ID: process.env[`FB${idx}_USER_ID`],
        PAGE_ID: process.env[`FB${idx}_PAGE_ID`],
        LONG_LIVED_TOKEN: process.env[`FB${idx}_LONG_LIVED_USER_TOKEN`],
        DISCORD_ANNOUNCEMENTS_WEBHOOK_URL: process.env[`FB${idx}_DISCORD_ANNOUNCEMENTS_WEBHOOK_URL`],
        DISCORD_EXAM_SCHEDULES_WEBHOOK_URL: process.env[`FB${idx}_DISCORD_EXAM_SCHEDULES_WEBHOOK_URL`],
        DISCORD_ACHIEVEMENTS_WEBHOOK_URL: process.env[`FB${idx}_DISCORD_ACHIEVEMENTS_WEBHOOK_URL`],
        DISCORD_EVENTS_WEBHOOK_URL: process.env[`FB${idx}_DISCORD_EVENTS_WEBHOOK_URL`],
        DISCORD_GENERAL_CHAT_WEBHOOK_URL: process.env[`FB${idx}_DISCORD_GENERAL_CHAT_WEBHOOK_URL`],
    }));
}
/**
 * Checks all FB pages in the environment for a SHORT_LIVED_USER_TOKEN (and no LONG_LIVED_USER_TOKEN),
 * exchanges it for a long-lived user token, updates the .env file, and removes the short-lived token.
 * Call this function on startup if you want to auto-upgrade tokens.
 */
async function upgradeShortLivedTokensIfNeeded() {
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
            const url = `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/oauth/access_token` +
                `?grant_type=fb_exchange_token` +
                `&client_id=${pageConfig.APP_ID}` +
                `&client_secret=${pageConfig.APP_SECRET}` +
                `&fb_exchange_token=${shortToken}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.access_token) {
                    // Update .env: set long-lived token, remove short-lived token
                    const longTokenRegex = new RegExp(`${longTokenKey}=.*`, "g");
                    const shortTokenRegex = new RegExp(`${shortTokenKey}=.*`, "g");
                    if (envContent.match(longTokenRegex)) {
                        envContent = envContent.replace(longTokenRegex, `${longTokenKey}=${data.access_token}`);
                    }
                    else {
                        envContent += `\n${longTokenKey}=${data.access_token}`;
                    }
                    // Remove the short-lived token line
                    envContent = envContent.replace(shortTokenRegex, `${shortTokenKey}=`);
                    // Update process.env for immediate use
                    process.env[longTokenKey] = data.access_token;
                    process.env[shortTokenKey] = "";
                    updated = true;
                    console.log(`Upgraded FB${pageConfig.index} short-lived token to long-lived token.`);
                }
                else {
                    console.error(`Failed to upgrade short-lived token for FB${pageConfig.index}:`, data);
                }
            }
            catch (err) {
                console.error(`Error upgrading short-lived token for FB${pageConfig.index}:`, err);
            }
        }
    }
    if (updated) {
        fs.writeFileSync(envPath, envContent, "utf8");
        console.log(".env file updated with new long-lived tokens.");
    }
}
/**
 * Refresh the Facebook long-lived user access token.
 * Returns the new token if successful, or null if failed.
 */
async function refreshLongLivedUserToken(pageConfig) {
    const url = `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${pageConfig.APP_ID}` +
        `&client_secret=${pageConfig.APP_SECRET}` +
        `&fb_exchange_token=${pageConfig.LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.access_token) {
        console.log(`Refreshed long-lived user token for FB${pageConfig.index}:`, data.access_token);
        return data.access_token;
    }
    else {
        console.error(`Failed to refresh token for FB${pageConfig.index}:`, data);
        return null;
    }
}
/**
 * Get the page access token for the configured Facebook Page.
 * Returns the page access token if found, or null if not found.
 */
async function getPageAccessToken(pageConfig) {
    const url = `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/${pageConfig.USER_ID}/accounts?access_token=${pageConfig.LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const page = data.data?.find((page) => page.id === pageConfig.PAGE_ID);
    if (page && page.access_token) {
        console.log(`Page Access Token for FB${pageConfig.index}:`, page.access_token);
        return page.access_token;
    }
    else {
        console.error(`Error: Page with the specified FB${pageConfig.index}_PAGE_ID not found or missing access_token.`);
        return null;
    }
}
/**
 * Update the FB_LONG_LIVED_USER_TOKEN in the .env file.
 * Overwrites the existing token line with the new token.
 */
function updateEnvToken(newToken, pageIndex) {
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = new RegExp(`FB${pageIndex}_LONG_LIVED_USER_TOKEN=.*`, "g");
    envContent = envContent.replace(regex, `FB${pageIndex}_LONG_LIVED_USER_TOKEN=${newToken}`);
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(`Updated .env with new long-lived user token for FB${pageIndex}.`);
}
/**
 * Update the FB_PAGE_ACCESS_TOKEN in the .env file.
 * Adds the line if it doesn't exist, or replaces it if it does.
 */
function updateEnvPageToken(newPageToken) {
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.match(/^FB_PAGE_ACCESS_TOKEN=.*$/m)) {
        envContent = envContent.replace(/^FB_PAGE_ACCESS_TOKEN=.*$/m, `FB_PAGE_ACCESS_TOKEN=${newPageToken}`);
    }
    else {
        envContent += `\nFB_PAGE_ACCESS_TOKEN=${newPageToken}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("Updated .env with new page access token.");
}
/**
 * Fetch the latest posts from the configured Facebook Page.
 * Returns an array of post objects or null if an error occurs.
 */
async function getFacebookPagePosts(pageConfig, limit = 10) {
    if (!pageConfig.PAGE_ID) {
        console.error(`FB${pageConfig.index}_PAGE_ID is missing in .env`);
        return null;
    }
    const pageAccessToken = await getPageAccessToken(pageConfig);
    if (!pageAccessToken) {
        console.error(`Failed to retrieve Page Access Token for FB${pageConfig.index}.`);
        return null;
    }
    const fields = "id,child_attachments,message,full_picture,attachments{media,target},permalink_url,properties,created_time,is_published,status_type";
    const url = `https://graph.facebook.com/${pageConfig.GRAPH_API_VERSION}/${pageConfig.PAGE_ID}/posts?fields=${fields}&access_token=${pageAccessToken}&limit=${limit}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error(`Error fetching Facebook posts for FB${pageConfig.index}:`, data.error);
            return null;
        }
        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(now.getDate() - 7);
        const postsWithAttachments = (data.data || []).filter((post) => post.attachments &&
            post.attachments.data &&
            new Date(post.created_time) >= fiveDaysAgo);
        postsWithAttachments.sort((a, b) => new Date(a.created_time).getTime() -
            new Date(b.created_time).getTime());
        return postsWithAttachments;
    }
    catch (err) {
        console.error(`Fetch error for FB${pageConfig.index}:`, err);
        return null;
    }
}
