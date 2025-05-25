/**
 * Facebook Graph API Helper Module
 *
 * This script handles Facebook Graph API authentication and token management
 * for fetching posts from the CLSU ITSC Facebook Page.
 * It is designed to be used by the CLSU IT Discord bot to retrieve and post
 * updates from the Facebook Page into the Discord server.
 */

/**
 * This module requires the following environment variables:
 * - FB_GRAPH_API_VERSION: Version of the Facebook Graph API to use
 * - FB_APP_ID: Facebook App ID
 * - FB_APP_SECRET: Facebook App Secret
 * - FB_USER_ID: Facebook User ID of the bot owner
 * - FB_PAGE_ID: Facebook Page ID to fetch posts from
 * - FB_LONG_LIVED_USER_TOKEN: Long-lived user access token for the bot owner
 */
require("dotenv").config();

const FB_GRAPH_API_VERSION = process.env.FB_GRAPH_API_VERSION;
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_USER_ID = process.env.FB_USER_ID;
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_LONG_LIVED_TOKEN = process.env.FB_LONG_LIVED_USER_TOKEN;

/**
 * Import required modules
 * - fs: For reading and writing the .env file
 * - path: For resolving file paths
 * - node-fetch: For making HTTP requests to the Facebook Graph API
 */
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

/**
 * Refresh the Facebook long-lived user access token.
 * Returns the new token if successful, or null if failed.
 */
async function refreshLongLivedUserToken() {
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
async function getPageAccessToken() {
    const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${FB_USER_ID}/accounts?access_token=${FB_LONG_LIVED_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const page = data.data?.find((page) => page.id === FB_PAGE_ID);
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
function updateEnvToken(newToken) {
    const envPath = path.resolve(__dirname, ".env");
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
function updateEnvPageToken(newPageToken) {
    const envPath = path.resolve(__dirname, ".env");
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
async function getFacebookPagePosts(limit = 10) {
    // Validate required environment variables
    if (!FB_PAGE_ID) {
        console.error("FB_PAGE_ID is missing in .env");
        return null;
    }

    // Get the latest Page Access Token dynamically
    const pageAccessToken = await getPageAccessToken();
    if (!pageAccessToken) {
        console.error("Failed to retrieve Page Access Token.");
        return null;
    }

    // Define the fields to fetch from the Facebook Graph API
    const fields =
        "id,child_attachments,message,full_picture,attachments{media,target},permalink_url,properties,created_time,is_published,status_type";
    // Construct the URL for fetching posts
    const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${FB_PAGE_ID}/posts?fields=${fields}&access_token=${pageAccessToken}&limit=${limit}`;

    // Fetch the posts from the Facebook Graph API
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error("Error fetching Facebook posts:", data.error);
            return null;
        }

        // Filter out posts without attachments and only include posts from the past 5 days
        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(now.getDate() - 5);

        // Filter out posts without attachments and older than 7 days
        const postsWithAttachments = (data.data || []).filter(
            (post) =>
                post.attachments &&
                post.attachments.data &&
                new Date(post.created_time) >= fiveDaysAgo
        );

        // Sort posts by created_time ascending (oldest to newest)
        postsWithAttachments.sort(
            (a, b) => new Date(a.created_time) - new Date(b.created_time)
        );

        // Returns an array of post objects
        return postsWithAttachments;
    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}

async function getSharedPosts(postId, pageAccessToken, limit = 10) {
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

async function fetchSharedPostImage(postId, pageAccessToken) {
    const fields = "full_picture";
    const url = `https://graph.facebook.com/v19.0/${postId}?fields=${fields}&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.full_picture || null;
}

// Export all Facebook API helper functions
module.exports = {
    refreshLongLivedUserToken,
    getPageAccessToken,
    updateEnvToken,
    updateEnvPageToken,
    getFacebookPagePosts,
    getSharedPosts,
    fetchSharedPostImage,
};
