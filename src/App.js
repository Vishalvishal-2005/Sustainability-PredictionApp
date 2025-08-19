import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './assets/style.css';
import Analysis from './components/AnalysisPage';
import Home from './components/Login';
import PredictionResults from './components/PredictionResult';
import Signup from './components/Signup';
import UserInterface from './components/UserInterface';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/Login" element={<Home />} />
        <Route path="/" element={<UserInterface />} />
        <Route path="/results" element={<PredictionResults />} />
        <Route path="/analysis" element={<Analysis/>} />

      </Routes>
    </Router>
  );
}

export default App;
