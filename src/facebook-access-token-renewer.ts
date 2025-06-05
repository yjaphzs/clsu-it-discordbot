/**
 * Facebook Access Token Renewer
 * --------------------------------
 * This module manages the automatic renewal of the Facebook long-lived user access token
 * for the CLSU IT Discord Bot.
 *
 * It checks if today is Saturday and the token has not yet been renewed this week.
 * If so, it renews the token using the Facebook API, updates both the .env file and the in-memory
 * environment variable so the bot can use the new token immediately, and sets a flag in renew.json
 * (located in the data/ directory) to prevent multiple renewals in the same week.
 *
 * On Sunday, if the token was already renewed this week, it resets the renewed flag in renew.json
 * to allow the renewal process to run again the following weekend.
 *
 * The renewed flag can also be reset every Monday at 12:01 AM by a separate scheduler if desired.
 *
 * Usage: Call the exported function once on bot startup. For repeated execution (e.g., every 2 hours),
 * use setInterval or an external scheduler to call the function as needed.
 */

import * as fs from "fs";
import * as path from "path";

import {
    getFacebookPagesConfig,
    refreshLongLivedUserToken,
    updateEnvToken,
} from "./facebook-api";

// Resolve the absolute path to the 'data' directory inside the current directory (dist/data at runtime)
const dataDir = path.resolve(__dirname, "data");

// Create the 'data' directory if it does not exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Set the path for renew.json inside the 'data' directory (dist/data/renew.json at runtime)
const renewPath = path.join(dataDir, "renew.json");

/**
 * Checks if the Facebook token has already been renewed for the current week.
 * If not, marks it as renewed and updates the timestamp.
 * @returns {boolean} true if already renewed, false if not (and sets as renewed)
 */
function checkAndSetRenewed(): boolean {
    let renewed = false;
    let renewData = { renewed: false, lastRenewed: "" };

    if (fs.existsSync(renewPath)) {
        try {
            renewData = JSON.parse(fs.readFileSync(renewPath, "utf-8"));
            renewed = renewData.renewed;
        } catch {
            renewed = false;
        }
    }

    // If not renewed, set as renewed and update lastRenewed
    if (!renewed) {
        renewData.renewed = true;
        renewData.lastRenewed = new Date().toISOString();
        fs.writeFileSync(renewPath, JSON.stringify(renewData, null, 2));
        return false; // Not renewed before, so should execute
    }
    return true; // Already renewed
}

/**
 * Resets the renewed flag in renew.json every Monday,
 * allowing the renewal process to run again the following weekend.
 */
function resetRenewedFlag() {
    const renewData = { renewed: false, lastRenewed: "" };
    fs.writeFileSync(renewPath, JSON.stringify(renewData, null, 2));
}

function isTodaySaturday(): boolean {
    return new Date().getDay() === 6;
}

function isTodaySunday(): boolean {
    return new Date().getDay() === 0;
}

/**
 * Registers logic for Facebook access token renewal and flag reset.
 *
 * - On startup, attempts to renew the Facebook long-lived user token if today is Saturday and it has not yet been renewed this week.
 *   - If renewal is successful, updates both the .env file and the in-memory environment variable so the new token is used immediately.
 *   - Sets the renewed flag in renew.json to prevent multiple renewals in the same week.
 *
 * - Also on startup, if today is Sunday and the token has already been renewed this week, resets the renewed flag in renew.json.
 *   - This allows the renewal process to run again the following weekend.
 *
 * Usage: Call this function once on bot startup. For repeated execution (e.g., every 2 hours), use setInterval or an external scheduler.
 */
export function registerFacebookAcessTokenRenewerCronJobs() {
    /**
     * Attempts to renew the Facebook token if today is Saturday and not yet renewed this week.
     * Updates both the .env file and in-memory variable for immediate use.
     */
    async function refreshTokenIfSaturday() {
        if (!isTodaySaturday()) return;
        if (checkAndSetRenewed()) return;

        // Renew the Facebook long-lived access token for each configured page
        const pages = getFacebookPagesConfig();
        for (const pageConfig of pages) {
            try {
                const newToken = await refreshLongLivedUserToken(pageConfig);
                if (newToken) {
                    updateEnvToken(newToken, pageConfig.index);
                    // Also update the in-memory environment variable for immediate use
                    process.env[`FB${pageConfig.index}_LONG_LIVED_USER_TOKEN`] =
                        newToken;
                    console.log(
                        `Facebook long-lived user token successfully renewed for FB${pageConfig.index}.`
                    );
                } else {
                    console.error(
                        `Failed to renew Facebook long-lived user token for FB${pageConfig.index}.`
                    );
                }
            } catch (err) {
                console.error(
                    `Error during Facebook token renewal for FB${pageConfig.index}:`,
                    err
                );
            }
        }

        console.log("Token renewal logic executed for Saturday.");
    }

    /**
     * Resets the renewed flag if today is Sunday and the token was already renewed this week.
     * This allows the renewal process to run again the following weekend.
     */
    async function resetRenewedFlagIfSunday() {
        if (!isTodaySunday()) return;
        if (!checkAndSetRenewed()) return;

        // Reset the renewed flag for the next week
        resetRenewedFlag();

        console.log("Renewed flag reset for the new week (Sunday).");
    }

    // Run immediately on startup
    refreshTokenIfSaturday();
    resetRenewedFlagIfSunday();
}
