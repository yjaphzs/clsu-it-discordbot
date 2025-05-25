/**
 * Utility functions for managing posted Facebook IDs.
 * These functions ensure that a Facebook post is not posted to Discord multiple times.
 */

const fs = require("fs");
const path = require("path");
const postedPath = path.join(__dirname, "posted.json");

/**
 * Retrieve the list of Facebook post IDs that have already been posted to Discord.
 * @returns {Array<string>} Array of posted Facebook post IDs.
 */
function getPostedIds() {
    if (!fs.existsSync(postedPath)) return [];
    return JSON.parse(fs.readFileSync(postedPath, "utf8"));
}

/**
 * Save a Facebook post ID to the list of posted IDs.
 * Ensures the same post is not posted to Discord multiple times.
 * @param {string} id - The Facebook post ID to save.
 */
function savePostedId(id) {
    const ids = getPostedIds();
    if (!ids.includes(id)) {
        ids.push(id);
        fs.writeFileSync(postedPath, JSON.stringify(ids, null, 2));
    }
}

module.exports = { getPostedIds, savePostedId };
