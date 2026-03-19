import fs from 'fs';
import express from 'express';
import type { Request, Response } from 'express';
import RSSReader from './Reader';

const urlsRaw = fs.readFileSync(process.env.RSS_URLS || 'urls-example.txt', 'utf-8');
const urls: string[] = urlsRaw.split('\n').filter(line => line.trim() !== '');
const port = process.env.RSS_PORT || 3000;
const cacheDuration = Number(process.env.RSS_CACHE_DUR) || (30 * 60 * 1000); // 30 minutes
const app = express();
const reader = new RSSReader(urls, cacheDuration);

console.log(`Loaded ${urls.length} URLs from list`);
for (const url of urls) {
  console.log(`- ${url}`);
}

app.use(express.static('public'));

app.get('/json', async (_req: Request, res: Response) => {
  // Fetch new data
  const response = await reader.fetchAll();
  console.log(`Fetched in ${response.meta.fetchTime}ms from ${response.meta.sourceCount} sources`);
  // Return response
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
