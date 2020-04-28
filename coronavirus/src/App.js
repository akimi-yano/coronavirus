import React from 'react';
import { HashRouter, Route, Link } from "react-router-dom";
import Dash from './components/Dash'
import About from './components/About'
import HeaderWithRouter from './components/Header'
import JHU from'./contexts/JHU'
import './App.css';

import 'mapbox.js/dist/mapbox.css'

function App() {
  return (
    <div>

<JHU>
    <HashRouter basename='/'>
    <HeaderWithRouter/>
      <Route path="/about" component={About} />
    </HashRouter>
    <Dash/>
</JHU>
    </div>
   );
}

export default App;
