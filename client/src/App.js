import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import Analysis from './components/Analysis';
import Optimization from './components/Optimization';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container-fluid">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/add" element={<ProjectForm />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/optimization" element={<Optimization />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
