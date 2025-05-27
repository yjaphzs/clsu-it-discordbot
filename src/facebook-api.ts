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
const fetch: typeof globalThis.fetch = global.fetch ? global.fetch : require("node-fetch");

dotenv.config();

const FB_GRAPH_API_VERSION = process.env.FB_GRAPH_API_VERSION as string;
const FB_APP_ID = process.env.FB_APP_ID as string;
const FB_APP_SECRET = process.env.FB_APP_SECRET as string;
const FB_USER_ID = process.env.FB_USER_ID as string;
const FB_PAGE_ID = process.env.FB_PAGE_ID as string;
const FB_LONG_LIVED_TOKEN = process.env.FB_LONG_LIVED_USER_TOKEN as string;

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
export async function refreshLongLivedUserToken(): Promise<string | null> {
    const url =
        `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${FB_APP_ID}` +
        `&client_secret=${FB_APP_SECRET}` +
        `&fb_exchange_token=${FB_LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.access_token) {
        console.log("Refreshed long-lived user token:", data.access_token);
        return data.access_token;
    } else {
        console.error("Failed to refresh token:", data);
        return null;
    }
}

/**
 * Get the page access token for the configured Facebook Page.
 * Returns the page access token if found, or null if not found.
 */
export async function getPageAccessToken(): Promise<string | null> {
    const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${FB_USER_ID}/accounts?access_token=${FB_LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const page = data.data?.find((page: any) => page.id === FB_PAGE_ID);
    if (page && page.access_token) {
        console.log("Page Access Token:", page.access_token);
        return page.access_token;
    } else {
        console.error(
            "Error: Page with the specified FB_PAGE_ID not found or missing access_token."
        );
        return null;
    }
}

/**
 * Update the FB_LONG_LIVED_USER_TOKEN in the .env file.
 * Overwrites the existing token line with the new token.
 */
export function updateEnvToken(newToken: string): void {
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(
        /FB_LONG_LIVED_USER_TOKEN=.*/g,
        `FB_LONG_LIVED_USER_TOKEN=${newToken}`
    );
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("Updated .env with new long-lived user token.");
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
export async function getFacebookPagePosts(limit = 10): Promise<FacebookPost[] | null> {
    if (!FB_PAGE_ID) {
        console.error("FB_PAGE_ID is missing in .env");
        return null;
    }

    const pageAccessToken = await getPageAccessToken();
    if (!pageAccessToken) {
        console.error("Failed to retrieve Page Access Token.");
        return null;
    }

    const fields =
        "id,child_attachments,message,full_picture,attachments{media,target},permalink_url,properties,created_time,is_published,status_type";
    const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${FB_PAGE_ID}/posts?fields=${fields}&access_token=${pageAccessToken}&limit=${limit}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error("Error fetching Facebook posts:", data.error);
            return null;
        }

        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(now.getDate() - 5);

        const postsWithAttachments = (data.data || []).filter(
            (post: FacebookPost) =>
                post.attachments &&
                post.attachments.data &&
                new Date(post.created_time!) >= fiveDaysAgo
        );

        postsWithAttachments.sort(
            (a: FacebookPost, b: FacebookPost) =>
                new Date(a.created_time!).getTime() - new Date(b.created_time!).getTime()
        );

        return postsWithAttachments;
    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}

/**
 * Fetch posts that have shared the given post (sharedposts edge).
 * @param postId - The ID of the original post.
 * @param pageAccessToken - The Facebook Page Access Token.
 * @param limit - Number of shared posts to fetch.
 * @returns Array of shared post objects.
 */
export async function getSharedPosts(
    postId: string,
    pageAccessToken: string,
    limit = 10
): Promise<FacebookPost[]> {
    const fields = "id,message,created_time,permalink_url,full_picture";
    const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${postId}/sharedposts?fields=${fields}&access_token=${pageAccessToken}&limit=${limit}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error("Error fetching shared posts:", data.error);
            return [];
        }
        return data.data || [];
    } catch (err) {
        console.error("Fetch error:", err);
        return [];
    }
}

/**
 * Fetch the full_picture (image) of a post by its ID.
 * @param postId - The ID of the post.
 * @param pageAccessToken - The Facebook Page Access Token.
 * @returns The image URL or null if not found.
 */
export async function fetchSharedPostImage(
    postId: string,
    pageAccessToken: string
): Promise<string | null> {
    const fields = "full_picture";
    const url = `https://graph.facebook.com/v19.0/${postId}?fields=${fields}&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.full_picture || null;
}