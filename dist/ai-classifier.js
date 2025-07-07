"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostClassifier = void 0;
const ollama_1 = require("ollama");
const classification_cache_1 = require("./classification-cache");
class PostClassifier {
    constructor() {
        this.ollama = new ollama_1.Ollama({
            host: 'http://localhost:11434' // Default Ollama host
        });
        this.cache = new classification_cache_1.ClassificationCache();
    }
    async classifyPost(message) {
        // Check cache first
        const cachedResult = this.cache.get(message);
        if (cachedResult) {
            console.log(`Using cached classification: ${cachedResult}`);
            return {
                category: cachedResult,
                confidence: 100 // Cached results are trusted
            };
        }
        try {
            const prompt = `You are a content classifier for a university IT department's social media posts.
Classify this post into exactly ONE category:

- ANNOUNCEMENT: General notices, memorandums, schedules, academic processes, advisories
- EVENT: Workshops, seminars, competitions, orientations, invitations, hackathons, registrations  
- ACHIEVEMENT: Congratulations, awards, graduates, scholars, winners, recognitions, celebrations
- BIRTHDAY: Birthday greetings, birthday celebrations, birthday wishes

Post: "${message}"

Respond with only the category name (ANNOUNCEMENT, EVENT, ACHIEVEMENT, or BIRTHDAY):`;
            const response = await this.ollama.generate({
                model: 'llama3.2:3b', // Lightweight model
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.1, // Low temperature for consistent results
                    top_p: 0.9,
                    stop: ['\n', '.', ',']
                }
            });
            const category = response.response.trim().toUpperCase();
            const validCategories = ['ANNOUNCEMENT', 'EVENT', 'ACHIEVEMENT', 'BIRTHDAY'];
            if (validCategories.includes(category)) {
                const classificationResult = {
                    category: category,
                    confidence: 85 // Ollama confidence estimate
                };
                // Cache the result for future use
                this.cache.set(message, category);
                console.log(`AI classified and cached: ${category}`);
                return classificationResult;
            }
            return null;
        }
        catch (error) {
            console.error('Ollama classification error:', error);
            return null;
        }
    }
    // Quick keyword-based pre-filtering for obvious cases
    quickClassify(message) {
        const lower = message.toLowerCase();
        // Check cache first for quick classifications too
        const cachedResult = this.cache.get(message);
        if (cachedResult) {
            return cachedResult;
        }
        let quickResult = null;
        // Obvious birthday posts
        if (lower.includes('happy birthday') || lower.includes('birthday greetings')) {
            quickResult = 'BIRTHDAY';
        }
        // Obvious announcements
        else if (lower.includes('memorandum') || lower.includes('please be informed')) {
            quickResult = 'ANNOUNCEMENT';
        }
        // Obvious achievements (only if not about registration)
        else if (lower.includes('congratulations') && !lower.includes('registration')) {
            quickResult = 'ACHIEVEMENT';
        }
        // Obvious events
        else if (lower.includes('registration is now open') || lower.includes('join us')) {
            quickResult = 'EVENT';
        }
        // Cache quick classifications too
        if (quickResult) {
            this.cache.set(message, quickResult);
            console.log(`Quick classified and cached: ${quickResult}`);
        }
        return quickResult;
    }
}
exports.PostClassifier = PostClassifier;
