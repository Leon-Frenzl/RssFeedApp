import express from 'express';
import Parser from 'rss-parser';

const app = express();
const port = 9000;
const parser = new Parser();

app.use((req, res, next) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/rss', async (req, res) => {
  const { feedUrl } = req.query;

  if (!feedUrl) {
    res.status(400).send({ error: 'Missing feedUrl parameter' });
    return;
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    res.send(feed);
  } catch (err) {
    console.error(`Error fetching RSS feed: ${err}`);
    res.status(500).send({ error: 'Failed to fetch RSS feed' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});