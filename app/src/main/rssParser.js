import Parser from 'rss-parser';

export async function parseRssFeeds_LastItem(ListofUrls) {
  if (!ListofUrls || ListofUrls.length === 0) {
    return [];
  }

  try {
    const parsedFeeds = [];
    const parser = new Parser();

    for (const urlObj of ListofUrls) {
      const url = urlObj.url;
      const feed = await parser.parseURL(url);

      if (feed && feed.items && feed.items.length > 0) {
        const feedItem = feed.items[feed.items.length - 1];
        const parsedFeed = {
          id: urlObj.id,
          url: url,
          subscribed: urlObj.subscribed,
          topic: urlObj.topic,
          title: feedItem.title,
          description: urlObj.description,
          link: feedItem.link,
          pubDate: feedItem.isoDate,
          author: feedItem.author,
          image: feed.image && feed.image.url ? feed.image.url : urlObj.image,
          overallDescription: feedItem.contentSnippet.replace(/\[(link|comments)\]/g, ''),
        };
        parsedFeeds.push(parsedFeed);
      }
    }

    return parsedFeeds;
  } catch (error) {
    console.error('Error parsing RSS feeds:', error);
    return [];
  }
}




export async function fetchRssFeeds(listOfUrls) {
  const parser = new Parser();
  const fetchPromises = listOfUrls.map(async (urlObj) => {
    try {
      const feed = await parser.parseURL(urlObj.url);
      const feedItem = feed.items[feed.items.length - 1];
      const feedImage = feed.image?.url || urlObj.image;
      const parsedFeed = {
        url: urlObj.url,
        topic: urlObj.topic,
        title: feedItem.title,
        description: urlObj.description,
        link: feedItem.link,
        pubDate: feedItem.isoDate,
        author: feedItem.author,
        image: feedImage,
        overallDescription: feedItem.contentSnippet.replace(/\[(link|comments)\]/g, ''),
      };
      return parsedFeed;
    } catch (error) {
      console.error(`Error fetching RSS feed: ${urlObj.url}`, error);
      return null;
    }
  });

  const feeds = await Promise.all(fetchPromises);
  return feeds.filter((feed) => feed !== null);
}
