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
    data.items.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.innerHTML = `<h2><a href="${item.link}" target="_blank">
            ${item.title}</a></h2>
            <p>Source: <a href="${item.source}">${item.source}</a></p>
            <p>${item.date}</p>
            <p>-------</p>
            <p>${item.description}</p>
            <hr/>`;
      rssFeedElement.appendChild(itemDiv);
    });
  })
  .catch((error) => console.error('Error fetching RSS feed:', error));
