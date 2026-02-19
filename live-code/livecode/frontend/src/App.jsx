
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProblemSolve from './pages/ProblemSolve';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/problems" element={<Dashboard />} />
        <Route path="/solve/:id" element={<ProblemSolve />} />
      </Routes>
    </Router>
  );
}

export default App;
