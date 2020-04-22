import React from 'react';
import { HashRouter, Route, Link } from "react-router-dom";
import Prediction from './components/Prediction'
import './App.css';

function App() {
  return (
    <HashRouter basename='/'>
     <div>
      <Route exact path="/" component={Prediction} />
      <Route path="/prediction" component={Prediction} />
     </div>
    </HashRouter>
   );
}

export default App;
