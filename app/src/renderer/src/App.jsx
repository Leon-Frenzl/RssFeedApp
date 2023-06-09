import React, { useState, useEffect } from 'react';

function App() {
  const [response, setResponse] = useState([]);

  const requestRssFeeds = () => {
    window.electron.ipcRenderer.send('request-rss-feeds');
  };

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;

    ipcRenderer.on('response-rss-feeds', (event, rssFeeds) => {
      setResponse(rssFeeds);
    });

    // Cleanup: remove the listener when the component unmounts
    return () => {
      ipcRenderer.removeAllListeners('response-rss-feeds');
    };
  }, []);

  return (
    <div>
      <button onClick={requestRssFeeds}>Request Rss Feeds</button>
      <div>
        {response.map((feed) => (
          <div key={feed.id}>{feed.url}</div>
        ))}
      </div>
    </div>
  );
}

export default App;