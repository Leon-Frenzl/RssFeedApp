import { useState } from 'react'
import './App.css'

function App() {

  fetch('http://localhost:9000/rss?feedUrl=https://www.youtube.com/feeds/videos.xml?channel_id=UCd4wVg3jzdaYtOkHI38EQ0w')
  .then(response => response.json())
  .then(feed => {
    console.log(feed);
  });

  return (
    <div className="App">
      <h1>News App</h1>
    </div>
  )
}

export default App
