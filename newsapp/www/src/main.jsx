import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

import './fonts/BebasNeue-Regular.ttf'

// function onWindowClose() {
//   Neutralino.app.exit();
// }

// Neutralino.init();
// Neutralino.events.on("windowClose", onWindowClose);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
