import React from 'react'
import ReactDOM from 'react-dom/client' // <--- This is the missing line!
import { Provider } from "react-redux";
import { store } from "./redux/store"; // Or "./redux/store" based on your path
import App from "./App";
import './index.css' // Optional, if you have a CSS file
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <Provider store={store}>

        <App />

    </Provider>
  </React.StrictMode>,
)