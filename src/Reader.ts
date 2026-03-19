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
  feeds: {
    [key: string]: RSSItem[];
  };
  meta: {
    fetchedAt: number;
    fetchTime: number;
    sourceCount: number;
    cached: boolean;
    errors: string[];
  };
};

import fs from 'fs';
import path from 'path';

class RSSReader {
  private cacheFile: string;
  private cacheDuration: number;
  private urls: string[];
  constructor(urls: string[], cacheDuration: number = 5 * 60 * 1000) {
    this.urls = urls;
    this.cacheDuration = cacheDuration;
    this.cacheFile = path.join(process.cwd(), 'rss_cache.json');
  }
  async fetchAll(): Promise<RSSResponse> {
    console.log('Fetching new data');
    let response: RSSResponse = {
      feeds: {},
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

    // Key response items by source
    for (let i = 0; i < this.urls.length; i++) {
      const source = this.urls[i];
      if (!source) continue;
      if (!itemsArrays[i]) continue;
      response.feeds[source] = itemsArrays[i]!;
    }

    // Update cache
    this.updateCache(response);
    response.meta.fetchTime = Date.now() - startTime;
    return response;
  }
  checkCache(): RSSResponse | null {
    if (!fs.existsSync(this.cacheFile)) return null;
    try {
      const data = fs.readFileSync(this.cacheFile, 'utf-8');
      const cache = JSON.parse(data) as { lastResponse: RSSResponse, lastFetch: number };
      const now = Date.now();
      if (cache.lastResponse && (now - cache.lastFetch) < this.cacheDuration) {
        console.log('Serving from file cache');
        return cache.lastResponse;
      }
    } catch (e) {
      console.error('Failed to read cache file:', e);
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
    const cacheData = {
      lastResponse: responseCopy,
      lastFetch: Date.now(),
    };
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData), 'utf-8');
    } catch (e) {
      console.error('Failed to write cache file:', e);
    }
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
