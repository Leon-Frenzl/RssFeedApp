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


function extractImageUrls(item) {
  const imageUrls = [];
  const mediaContent = item['media:content'];
  const fallbackImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAOVBMVEXm6ezb3uGXoazq7e/Dyc/l6ey/xcyrs7vX3OCnr7jV2d6Zo63O09ibpa+5wMezusLv8fTP1NnIzdMlnmvOAAABdElEQVR4nO3Z0ZKaMBiAUUwQlsaIy/s/bAHdabXxdmn7n3PDCDeZb0JA0nUAAAAAAAAAAAAAAAAAAAAAAAAAAP+u3HT0qA6UT/3Q1J+iZslDemsIGmVJpY5NtaTl6NEdItcyt5eTnMdSY06UlD7eXMk/UvrWofwtzu+bdNGb5NPl4/VGCd4kz+tjZnq5FrxJn8pqfp4psZvkqVxvfUmabB5Naulvn78S3NsEbzKkMpYy3lvkft6PsZt03bSusfW8n8rXVPblNnqTfBkeL/JbkrJHid6k+1pe1yRp/txnSvgmD3uSnC9bFE129yTbrbRG0WTzleQepVZNfkuyR9HkOck9Svgmz0nW30uJ3uQ1iWdxI0n4Jo0k0Zu0kgRv0kwStsn23T63k4RtkmsZb+s/4euttb8zxdzfWbYvA7WO0x9qSZejR3eM3Ke0ZmnuF/cxp8m2s7MMfctyjpoEAAAAAAAAAAAAAAAAAAAAAAAAAPgPnHj1E96TDiAitj9wAAAAAElFTkSuQmCC";

  if (mediaContent && mediaContent['$'] && mediaContent['$'].type && mediaContent['$'].type.startsWith('image/')) {
    const imageUrl = mediaContent['$'].url;
    if (imageUrl) {
      imageUrls.push(imageUrl);
    } else {
      imageUrls.push(fallbackImage);
    }
  } else {
    imageUrls.push(fallbackImage);
  }

  return imageUrls;
}


function extractVideoUrls(item) {
  const videoUrls = [];
  if (item['media:group'] && item['media:group']['media:content']) {
    const mediaContents = item['media:group']['media:content'];
    for (const mediaContent of mediaContents) {
      if (mediaContent['$']['type'].startsWith('video/')) {
        videoUrls.push(mediaContent['$']['url']);
      }
    }
  }
  return videoUrls;
}

export async function parseRssFeedForItems(url) {
  const parser = new Parser({
    customFields: {
      item: ['media:group', 'media:content'],
    }
  });
  try {
    const feed = await parser.parseURL(url);
    const items = feed.items.map((item) => {
      const title = feed.title;
      const categories = item.categories;
      const content = item.content;
      const contentSnippet = item.contentSnippet;
      const images = extractImageUrls(item);
      const videos = extractVideoUrls(item);

      return {
        title,
        categories,
        content,
        contentSnippet,
        images,
        videos,
        // Include other properties in the returned object
      };
    });
    return items;
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw error;
  }
}
