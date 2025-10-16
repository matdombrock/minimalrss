const rssUrl = '/json';
const rssFeedElement = document.getElementById('rss-feed');
const itemCountElement = document.getElementById('item-count');
fetch(rssUrl)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    itemCountElement.textContent = `${data.length}`;
    data.forEach((item) => {
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
