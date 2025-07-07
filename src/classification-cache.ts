interface CacheEntry {
    category: string;
    timestamp: number;
}

export class ClassificationCache {
    private cache = new Map<string, CacheEntry>();
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    private readonly MAX_CACHE_SIZE = 1000;

    private hashMessage(message: string): string {
        return message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .substring(0, 100);
    }

    get(message: string): string | null {
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

    set(message: string, category: string): void {
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