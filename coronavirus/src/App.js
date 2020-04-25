import React from 'react';
// import { HashRouter, Route, Link } from "react-router-dom";
import Dash from './components/Dash'
// import Prediction from './components/Prediction'
import './App.css';

import 'mapbox.js/dist/mapbox.css'

function App() {
  return (
    <div>
    <Dash/>

    {/* <HashRouter basename='/'> */}
     {/* <div> */}
      {/* <Route exact path="/" component={Prediction} />
      <Route path="/prediction" component={Prediction} /> */}
     {/* </div> */}
    {/* </HashRouter> */}
    </div>
   );
}

export default App;
