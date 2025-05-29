/**
 * Facebook Access Token Renewer
 * --------------------------------
 * This module manages the automatic renewal of the Facebook long-lived user access token
 * for the CLSU IT Discord Bot. It uses a cron job to attempt renewal every 2 hours on
 * Saturdays and Sundays, but ensures the renewal only happens once per week by tracking
 * the status in a renew.json file (located in the data/ directory).
 *
 * The renewed token is written to both the .env file and the in-memory environment variable,
 * so the bot can use the new token immediately without requiring a restart.
 *
 * The renewed flag is reset every Monday at 12:01 AM, allowing the process to repeat
 * the following weekend.
 */

import cron from "node-cron";
import * as fs from "fs";
import * as path from "path";

import { refreshLongLivedUserToken, updateEnvToken } from "./facebook-api";

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
    const renewPath = path.join(__dirname, "..", "data", "renew.json");
    const renewData = { renewed: false, lastRenewed: "" };
    fs.writeFileSync(renewPath, JSON.stringify(renewData, null, 2));
}

/**
 * Registers cron jobs for Facebook access token renewal:
 * - Every 2 hours on Saturday: Attempts to renew the token if not already renewed this week.
 * - Every 2 hours on Sunday: Only resets the renewed flag if not yet renewed.
 * - Every Monday at 12:01 AM: Resets the renewed flag for the new week.
 */
export function registerFacebookAcessTokenRenewerCronJobs() {
    // Every 2 hours on Saturday (0:00, 2:00, ..., 22:00)
    cron.schedule("0 */2 * * 6", async () => {
        if (checkAndSetRenewed()) return;

        // Renew the Facebook long-lived access token
        try {
            const newToken = await refreshLongLivedUserToken();
            if (newToken) {
                updateEnvToken(newToken);
                // Also update the in-memory environment variable for immediate use
                process.env.FB_LONG_LIVED_USER_TOKEN = newToken;
                console.log(
                    "Facebook long-lived user token successfully renewed."
                );
            } else {
                console.error(
                    "Failed to renew Facebook long-lived user token."
                );
            }
        } catch (err) {
            console.error("Error during Facebook token renewal:", err);
        }

        console.log("Scheduled job: Saturday every 2 hours (renewed)");
    });

    // Every 2 hours on Sunday (0:00, 2:00, ..., 22:00)
    cron.schedule("0 */2 * * 0", async () => {
        if (!checkAndSetRenewed()) return;

        // Optionally reset the renewed flag (or perform other Sunday logic)
        resetRenewedFlag();

        console.log("Sunday every 2 hours: Already renewed this week.");
    });

    // Reset the renewed flag every Monday at 12:01 AM
    cron.schedule("1 0 * * 1", () => {
        resetRenewedFlag();
        console.log("Renewed flag reset for the new week.");
    });
}
