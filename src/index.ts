import express from 'express';
import type { Request, Response } from 'express';
import config from './config';
import RSSReader from './Reader';

const app = express();
app.use(express.static('public'));
const reader = new RSSReader(config);

app.get('/json', async (req: Request, res: Response) => {
  // Check cache
  const cache = reader.checkCache();
  if (cache) {
    return res.json(cache);
  }
  // Fetch new data
  const response = await reader.fetchAll();
  // Return response
  res.json(response);
});

app.listen(config.port, () => {
  console.log(`Server listening at http://localhost:${config.port}`);
});
