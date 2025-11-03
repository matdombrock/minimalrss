# Minimal RSS Reader

A minimal self-hosted RSS reader with in-memory caching.

## Features

- A back-end written for the `bun` JavaScript runtime
- A front-end written in vanilla web technologies (no framework)

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

## Swap out the front-end

The back-end's main job is to take a set of RSS feeds, fetch their XML data and return a JSON object that contains the feed items and metadata. 

Make a request to `/json` to get this data. 

The data will have a format something like this:

```ts
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

