import React, { useState, useEffect } from 'react';

function ReadFeed() {
    const [response, setResponse] = useState([]);

    const requestRssFeeds = () => {
        const pageNumber = 1;
        const itemsPerPage = 10;

        window.electron.ipcRenderer.send('read-rssFeeds', pageNumber, itemsPerPage);
    };

    useEffect(() => {
        const ipcRenderer = window.electron.ipcRenderer;

        ipcRenderer.on('response-rssFeeds', (event, rssFeeds) => {
            setResponse(rssFeeds);
        });

        // Cleanup: remove the listener when the component unmounts
        return () => {
            ipcRenderer.removeAllListeners('response-rssFeeds');
        };
    }, []);

    return (
        <div>
            <button onClick={requestRssFeeds}>Request Rss Feeds</button>
            <div>
                {response.length === 0 ? (
                    <div>No feeds available.</div>
                ) : (
                    response.map((feed) => <div key={feed.id}>{feed.url}</div>)
                )}
            </div>
        </div>
    );
}

export default ReadFeed;
