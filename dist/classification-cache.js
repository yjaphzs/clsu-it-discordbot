"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassificationCache = void 0;
class ClassificationCache {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        this.MAX_CACHE_SIZE = 1000;
    }
    hashMessage(message) {
        return message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .substring(0, 100);
    }
    get(message) {
        const hash = this.hashMessage(message);
        const entry = this.cache.get(hash);
        if (entry && (Date.now() - entry.timestamp) < this.CACHE_DURATION) {
            return entry.category;
        }
        if (entry) {
            this.cache.delete(hash); // Remove expired entry
        }
        return null;
    }
    set(message, category) {
        const hash = this.hashMessage(message);
        // Remove oldest entry if cache is full
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(hash, {
            category,
            timestamp: Date.now()
        });
    }
}
exports.ClassificationCache = ClassificationCache;
