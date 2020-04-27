import React from 'react';
import { HashRouter, Route, Link } from "react-router-dom";
import Dash from './components/Dash'
import About from './components/About'
import HeaderWithRouter from './components/Header'
import './App.css';

import 'mapbox.js/dist/mapbox.css'

function App() {
  return (
    <div>

    <HashRouter basename='/'>
     <div>
    <HeaderWithRouter/>
      <Route path="/about" component={About} />
     </div>
    </HashRouter>
    <Dash/>
    </div>
   );
}

export default App;
