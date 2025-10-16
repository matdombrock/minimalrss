const rssUrl = '/json';
const rssFeedElement = document.getElementById('rss-feed');
const itemCountElement = document.getElementById('item-count');
const fetchTimeElement = document.getElementById('fetch-time');
const fetchedAtElement = document.getElementById('fetched-at');
fetch(rssUrl)
  .then((response) => response.json())
  .then((data) => {
    itemCountElement.textContent = data.items.length;
    fetchTimeElement.textContent = `${data.meta.fetchTime} ${data.meta.cached ? '(cached)' : ''}`;
    fetchedAtElement.textContent = new Date(data.meta.fetchedAt).toLocaleString();
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
