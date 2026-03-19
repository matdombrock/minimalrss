const rssUrl = '/json';
const rssFeedElement = document.getElementById('rss-feed');
const statusLineElement = document.getElementById('status-line');
const errorsElement = document.getElementById('errors');
fetch(rssUrl)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    // Sort by date
    // data.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // For each feed in data.items, sort the items by date
    for (const [key, item] of Object.entries(data.feeds)) {
      data.feeds[key].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Flatten all items into a single array
    // const items = [];
    // for (const feed of Object.values(data.feeds)) {
    //   items.push(...feed);
    // }
    //

    // Push items to the final listing in a round-robin way to ensure diversity
    const items = [];
    let maxFeedLength = Math.max(...Object.values(data.feeds).map(feed => feed.length));
    for (let i = 0; i < maxFeedLength; i++) {
      for (let [_key, feed] of Object.entries(data.feeds)) {
        const feedLength = feed.length;
        if (i < feedLength) {
          items.push(feed[i]);
        }
      }
    }

    console.log('Items to display:', items.length);
    console.log(items);


    let statusLine = `Fetched ${items.length} items from ${data.meta.sourceCount} sources in ${data.meta.fetchTime}ms at ${new Date(data.meta.fetchedAt).toLocaleString()} ${data.meta.cached ? '(cached)' : ''}`;
    statusLineElement.textContent = statusLine;
    errorsElement.innerHTML = data.meta.errors.length > 0 ? "Can't Fetch:<br/>!! " + data.meta.errors.join('<br/>!! ') : '';

    // Display items
    for (const item of items) {
      const itemWrap = document.createElement('div');
      itemWrap.classList.add('feed-item-wrap');

      const itemDiv = document.createElement('div');
      itemDiv.classList.add('feed-item');
      itemWrap.appendChild(itemDiv);

      // Title
      const h2 = document.createElement('h2');
      const titleLink = document.createElement('a');
      titleLink.href = item.link;
      titleLink.textContent = item.title;
      h2.appendChild(titleLink);
      itemDiv.appendChild(h2);

      // Source
      const sourceP = document.createElement('p');
      sourceP.textContent = 'Source: ';
      const sourceLink = document.createElement('a');
      sourceLink.href = item.source;
      sourceLink.textContent = item.source?.replace('https://', '').replace('http://', '');
      sourceP.appendChild(sourceLink);
      itemDiv.appendChild(sourceP);

      // Date
      const dateP = document.createElement('p');
      dateP.textContent = item.date;
      itemDiv.appendChild(dateP);

      // Separator
      const sepP = document.createElement('p');
      sepP.textContent = '-------';
      itemDiv.appendChild(sepP);

      // Description

      const descWrap = document.createElement('div');
      descWrap.classList.add('feed-item-desc-wrap');
      itemDiv.appendChild(descWrap);

      const descOverlay = document.createElement('div');
      descOverlay.classList.add('feed-item-overlay');
      descOverlay.textContent = '↓ more ↓';
      descWrap.appendChild(descOverlay);

      const descP = document.createElement('p');
      descP.innerHTML = item.description;
      descWrap.appendChild(descP);

      descWrap.addEventListener('click', () => {
        descWrap.classList.toggle('feed-item-desc-wrap-expanded');
        descOverlay.classList.toggle('feed-item-overlay-expanded');
      });

      // Horizontal rule
      const hr = document.createElement('hr');
      itemDiv.appendChild(hr);

      rssFeedElement.appendChild(itemWrap);
    }
  })
  .catch((error) => console.error('Error fetching RSS feed:', error));
