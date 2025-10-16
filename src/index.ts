import fs from 'fs';
import express from 'express';
import type { Request, Response } from 'express';
import RSSReader from './Reader';

const urlsRaw = fs.readFileSync(process.env.RSS_URLS || 'urls.txt', 'utf-8');
const urls: string[] = urlsRaw.split('\n').filter(line => line.trim() !== '');
const port = process.env.RSS_PORT || 3000;
const app = express();
const reader = new RSSReader(urls);

console.log(`Loaded ${urls.length} URLs from urls.txt`);
for (const url of urls) {
  console.log(`- ${url}`);
}

app.use(express.static('public'));

app.get('/json', async (_req: Request, res: Response) => {
  // Check cache
  const cache = reader.checkCache();
  if (cache) {
    return res.json(cache);
  }
  // Fetch new data
  const response = await reader.fetchAll();
  console.log(`Fetched ${response.items.length} items in ${response.meta.fetchTime}ms from ${response.meta.sourceCount} sources`);
  // Return response
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
