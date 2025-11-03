const rssUrl = '/json';
const rssFeedElement = document.getElementById('rss-feed');
const statusLineElement = document.getElementById('status-line');
const errorsElement = document.getElementById('errors');
fetch(rssUrl)
  .then((response) => response.json())
  .then((data) => {
    let statusLine = `Fetched ${data.items.length} items from ${data.meta.sourceCount} sources in ${data.meta.fetchTime}ms at ${new Date(data.meta.fetchedAt).toLocaleString()} ${data.meta.cached ? '(cached)' : ''}`;
    statusLineElement.textContent = statusLine;
    errorsElement.innerHTML = data.meta.errors.length > 0 ? "Can't Fetch:<br/>!! " + data.meta.errors.join('<br/>!! ') : '';
    for (const item of data.items) {
      const itemDiv = document.createElement('div');

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
      sourceLink.textContent = item.source;
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
      const descP = document.createElement('p');
      descP.innerHTML = item.description;
      itemDiv.appendChild(descP);

      // Horizontal rule
      const hr = document.createElement('hr');
      itemDiv.appendChild(hr);

      rssFeedElement.appendChild(itemDiv);
    }
  })
  .catch((error) => console.error('Error fetching RSS feed:', error));
