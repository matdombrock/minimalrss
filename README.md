# Minimal RSS Reader

A minimal self-hosted RSS reader with a file system-based cache for efficient performance and persistence.

## Features

- Back-end written for the `bun` JavaScript runtime
- Front-end in vanilla web technologies (no framework)
- File system-based caching for fast repeated access and reduced network usage
- Grouped feed data structure for easy access to items by source
- Easily swappable front-end

## Setup

This project uses the `bun` runtime. An alternative to NodeJS/NPM and more. 

[Install Bun](https://bun.com/docs/installation)

Install the dependencies:
```bash
bun install
```

> [!NOTE]  
> This will likely also work with NodeJS/NPM.

### RSS_URLS

A URL list is a plain text file with a new URL on each line. No commas are needed.

Here is an example of a `urls.txt` file. 
```
https://lemmy.ml/feeds/c/linux.xml?sort=Active
https://lemmy.ml/feeds/c/lemmy.xml?sort=Active
https://hnrss.org/frontpage
```

The location of this file is defined with the `RSS_URLS` env var.

## Run

Simple:
```bash
bun serve
```

> [!TIP]  
> Open your browser to [localhost:3000](http://localhost:3000) to see the feed. 

Configured:
```bash
RSS_URLS=../my-urls.txt \
RSS_PORT=3001 \
RSS_CACHE_DUR=120 \
bun serve
```

- `RSS_URLS` - URL list path - defaults to 'urls-example.txt'
- `RSS_PORT` - Server port - defaults to 3000
- `RSS_CACHE_DUR` - Cache duration in seconds - defaults to 5 mins. 

### File System-Based Caching

The server uses a file system-based cache (by default `rss_cache.json` in the working directory) to store the latest fetched RSS data. This means:
- Faster repeated requests (no need to re-fetch feeds until cache expires)
- Cache persists across server restarts
- Cache duration is configurable via `RSS_CACHE_DUR`

**Benefits:**
- Greatly reduces network traffic and speeds up response times for repeated requests
- Ensures consistent data even if the server is restarted within the cache window
- Easy to inspect or clear the cache manually if needed


## Swap out the front-end

Its easily possible (but fully optional) to swap out the front-end. You could for example make a "fancy" UI using CSS, add searching / filtering etc. 

Just swap out the files in the `public` directory to change the front-end. 

### The `/json` endpoint
The back-end's main job is to take a set of RSS feeds, fetch their XML data and return a JSON object that contains the feed items and metadata. 

Make a request to `/json` to get this data. 

The data returned from `/json` is structured as follows:

```ts
type RSSResponse = {
  feeds: {
    [key: string]: RSSItem[]; // Each key is a feed source URL, value is an array of items
  };
  meta: {
    fetchedAt: number;    // Timestamp when data was fetched
    fetchTime: number;    // Time taken to fetch (ms)
    sourceCount: number;  // Number of sources requested
    cached: boolean;      // True if served from cache
    errors: string[];     // List of sources that failed to fetch
  };
};
```

Each RSS item has the following properties:

```ts
type RSSItem = {
  title: string;
  link: string;
  description: string;
  date: string;
  source: string;
};
```
