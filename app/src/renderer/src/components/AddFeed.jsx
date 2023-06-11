import React, { useState, useEffect } from 'react';

function AddFeed() {
    const [response, setResponse] = useState([]);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

    const rssFeedUrls = [
        'https://example3.com/rss', // Replace with the desired RSS feed URL
        'https://example4.com/rss', // Replace with another RSS feed URL
        'https://example5.com/rss', // Replace with another RSS feed URL
    ];
    const rssFeedTopic = 'Technology'; // Replace with the desired RSS feed topic

    const requestAddRssFeed = () => {
        if (currentUrlIndex < rssFeedUrls.length) {
            const url = rssFeedUrls[currentUrlIndex];
            window.electron.ipcRenderer.send('add-rssFeed', url, rssFeedTopic);
            setCurrentUrlIndex((prevIndex) => prevIndex + 1);
        }
    };

    useEffect(() => {
        const ipcRenderer = window.electron.ipcRenderer;

        ipcRenderer.on('rssFeed-added', (event, rssFeed) => {
            setResponse((prevResponse) => [...prevResponse, rssFeed]);
        });

        // Cleanup: remove the listener when the component unmounts
        return () => {
            ipcRenderer.removeAllListeners('rssFeed-added');
        };
    }, []);

    return (
        <div>
            <button onClick={requestAddRssFeed}>Add Rss Feed</button>
            <div>
                {response.length === 0 ? (
                    <div>No feeds available.</div>
                ) : (
                    <ul>
                        {response.map((feed, index) => (
                            <li key={feed.id} style={{ display: index === currentUrlIndex - 1 ? 'block' : 'none' }}>
                                {feed.url}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default AddFeed;
