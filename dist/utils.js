"use strict";
/**
 * Utility functions for managing posted Facebook IDs.
 * These functions ensure that a Facebook post is not posted to Discord multiple times.
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
exports.getPostedIds = getPostedIds;
exports.savePostedId = savePostedId;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
function getPostedIds() {
    if (!fs.existsSync(postedPath))
        return [];
    return JSON.parse(fs.readFileSync(postedPath, "utf8"));
}
/**
 * Save a Facebook post ID to the list of posted IDs.
 * Ensures the same post is not posted to Discord multiple times.
 * @param id - The Facebook post ID to save.
 */
function savePostedId(id) {
    const ids = getPostedIds();
    if (!ids.includes(id)) {
        ids.push(id);
        fs.writeFileSync(postedPath, JSON.stringify(ids, null, 2));
    }
}
