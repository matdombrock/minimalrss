# Minimal RSS Reader

A minimal self-hosted RSS reader with in-memory caching.

## Features

- A back-end written for the `bun` JavaScript runtime
- A front-end written in vanilla web technologies (no framework)

## Setup

This project uses the `bun` runtime. An alternative to NodeJS/NPM and more. 

[Install Bun](https://bun.com/docs/installation)

```bash
bun install
```

### RSS_URLS
A URL list is a plain text file with a new URL on each line. No commas are needed.

Here is an example of a `urls.txt` file. 
```
https://lemmy.ml/feeds/c/linux.xml?sort=Active
https://lemmy.ml/feeds/c/lemmy.xml?sort=Active
https://hnrss.org/frontpage
```

## Run

Simple:
```bash
bun run serve
```

Configured:
```bash
RSS_PORT=3001 RSS_URLS=urls-example.txt bun run serve
```

- `RSS_PORT` defaults to 3000
- `RSS_URLS` defaults to 'urls.txt'

