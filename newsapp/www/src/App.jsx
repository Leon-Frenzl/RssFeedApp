import { SplitScreen } from './LayoutComponents/SplitScreen/SpliteScreen';
import {AppRouter} from './LayoutComponents/Navbar/AppRouter'

import './App.css';

const LeftHandComponent = () => {return(<h1 style ={{backgroundColor: 'red'}}>Left</h1>)}


function App() {

  // Möglichkeit einen RSS Feed abzurufen
 /* fetch('http://localhost:9000/rss?feedUrl=https://www.youtube.com/feeds/videos.xml?channel_id=UCd4wVg3jzdaYtOkHI38EQ0w')
  .then(response => response.json())
  .then(feed => {
    console.log(feed);
  });*/

  return (
    <div className='App'>
      <AppRouter />
    </div>
    
  )
}

export default App
