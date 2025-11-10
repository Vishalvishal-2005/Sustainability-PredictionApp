import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import SustainabilityDashboard from './components/SustainabilityDashboard';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SustainabilityDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
