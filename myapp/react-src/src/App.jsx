import React, { useState, useEffect } from "react";
import { parseRSSURL } from "./services/rss-parser";

function App() {
  const [itemTitle, setItemTitle] = useState("");

  useEffect(() => {
    (async () => {
      const rssJSON = await parseRSSURL("https://www.reddit.com/.rss");
      const title = rssJSON.feed.entry[4].title;
      setItemTitle(title);
    })();
  }, []);

  return (
    <div>
      <h1>{itemTitle}</h1>
    </div>
  );
}

export default App;