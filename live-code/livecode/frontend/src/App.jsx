
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProblemSolve from './pages/ProblemSolve';
import AptitudeTest from './pages/AptitudeTest';
import AptitudeCategories from './pages/AptitudeCategories';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/problems" element={<Dashboard />} />
        <Route path="/solve/:id" element={<ProblemSolve />} />
        <Route path="/aptitude-test" element={<AptitudeTest />} />
        <Route path="/aptitude-selection" element={<AptitudeCategories />} />
      </Routes>
    </Router>
  );
}

export default App;
