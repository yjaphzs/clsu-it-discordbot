/**
 * Utility functions for managing posted Facebook IDs.
 * These functions ensure that a Facebook post is not posted to Discord multiple times.
 */

import * as fs from "fs";
import * as path from "path";

// Resolve the absolute path to the 'data' directory inside the current directory (dist/data at runtime)
const dataDir = path.resolve(__dirname, "data");

// Create the 'data' directory if it does not exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Set the path for posted.json inside the 'data' directory (dist/data/posted.json at runtime)
const postedPath = path.join(dataDir, "posted.json");

/**
 * Retrieve the list of Facebook post IDs that have already been posted to Discord.
 * @returns Array of posted Facebook post IDs.
 */
export function getPostedIds(): string[] {
    if (!fs.existsSync(postedPath)) return [];
    return JSON.parse(fs.readFileSync(postedPath, "utf8"));
}

/**
 * Save a Facebook post ID to the list of posted IDs.
 * Ensures the same post is not posted to Discord multiple times.
 * @param id - The Facebook post ID to save.
 */
export function savePostedId(id: string): void {
    const ids = getPostedIds();
    if (!ids.includes(id)) {
        ids.push(id);
        // If the total IDs exceed 500, remove the oldest ones
        if (ids.length > 500) {
            ids.splice(0, ids.length - 500);
        }
        fs.writeFileSync(postedPath, JSON.stringify(ids, null, 2));
    }
}
