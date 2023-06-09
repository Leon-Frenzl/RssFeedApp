import Parser from 'rss-parser';

const parser = new Parser();

export async function parseRssFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (error) {
    console.error(`Error parsing RSS feed: ${error}`);
    throw new Error('Failed to parse RSS feed');
  }
}
