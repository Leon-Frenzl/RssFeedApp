const X2JS = require("x2js");

async function parseRSSURL(rssURL) {
  const { default: fetch } = await import('node-fetch');
  try {
    const response = await fetch(rssURL);
    const xml = await response.text();
    const result = await parseString(xml);
    return result;
  } catch (error) {
    console.error(error);
  }
}

function parseString(str) {
  const x2js = new X2JS();
  try {
    const document = x2js.xml2js(str);
    return document;
  } catch (error) {
    throw error;
  }
}

(async () => {
  const rssJSON = await parseRSSURL("https://www.reddit.com/.rss");
  const itemTitle = rssJSON.feed.entry[4].title;
  console.log(rssJSON.feed);
})();