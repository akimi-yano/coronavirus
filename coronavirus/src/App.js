import React from 'react';
import { HashRouter, Route, Link } from "react-router-dom";
import Map from './components/Map'
import Prediction from './components/Prediction'
import './App.css';

import 'mapbox.js/dist/mapbox.css'

function App() {
  return (
    <div>
    <Map/>
    <HashRouter basename='/'>
     <div>
      <Route exact path="/" component={Prediction} />
      <Route path="/prediction" component={Prediction} />
     </div>
    </HashRouter>
    </div>
   );
}

export default App;
