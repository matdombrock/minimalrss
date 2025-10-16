import axios from 'axios';
import { Parser } from 'xml2js';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

type RSSItem = {
  title: string;
  link: string;
  description: string;
  date: string;
  source: string;
};

type RSSResponse = {
  items: RSSItem[];
  meta: {
    fetchedAt: number;
    fetchTime: number;
    sourceCount: number;
    cached: boolean;
    errors: string[];
  };
};

class RSSReader {
  private cache: {
    lastResponse: RSSResponse | null;
    lastFetch: number;
    cacheDuration: number;
  };
  private urls: string[];
  constructor(urls: string[]) {
    this.urls = urls;
    this.cache = {
      lastResponse: null,
      lastFetch: 0,
      cacheDuration: Number(process.env.RSS_CACHE_DUR) || (5 * 60 * 1000), // 5 minutes
    };
  }
  async fetchAll(): Promise<RSSResponse> {
    console.log('Fetching new data');
    let response: RSSResponse = {
      items: [],
      meta: {
        fetchedAt: Date.now(),
        fetchTime: 0,
        sourceCount: this.urls.length,
        cached: false,
        errors: []
      },
    };
    const startTime = Date.now();
    // Start all requests at once, handle errors gracefully
    const itemsArrays = await Promise.all(
      this.urls.map(async url => {
        try {
          return await this.urlToRSSItem(url);
        } catch (_error) {
          console.error(`Failed to fetch or parse RSS from ${url}`);
          response.meta.errors.push(url);
          return [];
        }
      })
    );
    // Flatten the array of arrays
    response.items = itemsArrays.flat();
    // Sort by date descending
    response.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // Update cache
    this.updateCache(response);
    response.meta.fetchTime = Date.now() - startTime;
    return response;
  }
  checkCache(): RSSResponse | null {
    const now = Date.now();
    if (this.cache.lastResponse && (now - this.cache.lastFetch) < this.cache.cacheDuration) {
      console.log('Serving from cache');
      console.log(`Cache time remaining: ${((this.cache.cacheDuration - (now - this.cache.lastFetch)) / 1000).toFixed(0)} seconds`);
      return this.cache.lastResponse;
    }
    return null;
  }
  private cleanDescription(dirty: string): string {
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    const cleanDescription = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'] });
    return cleanDescription;
  }
  private updateCache(response: RSSResponse): void {
    const responseCopy = JSON.parse(JSON.stringify(response));
    responseCopy.meta.cached = true;
    this.cache.lastResponse = responseCopy;
    this.cache.lastFetch = Date.now();
  }
  private async rssToJson(url: string): Promise<any> {
    const response = await axios.get(url);
    const xml = response.data;
    const parser = new Parser({ explicitArray: false });
    const json = await parser.parseStringPromise(xml);
    return json;
  }
  private async urlToRSSItem(url: string): Promise<RSSItem[]> {
    const json = await this.rssToJson(url);
    const source = json.rss.channel.link;
    let out: RSSItem[] = [];
    for (const item of json.rss.channel.item) {
      item.description = this.cleanDescription(item.description);
      out.push({
        title: item.title,
        link: item.link,
        date: item.pubDate,
        description: item.description,
        source: source,
      });
    }
    return out;
  }
}

export default RSSReader;
