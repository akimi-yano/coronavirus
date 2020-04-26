import React from 'react';
import { HashRouter, Route, Link } from "react-router-dom";
import Dash from './components/Dash'
import About from './components/About'
import Header from './components/Header'
import './App.css';

import 'mapbox.js/dist/mapbox.css'

function App() {
  return (
    <div>
    <Header/>  
    <Dash/>

    <HashRouter basename='/'>
     <div>
      <Route path="/about" component={About} />
     </div>
    </HashRouter>
    </div>
   );
}

export default App;
