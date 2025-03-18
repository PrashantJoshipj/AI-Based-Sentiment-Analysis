import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CommentAnalyzer } from './components/CommentAnalyzer';
import GoBackButton from './components/GoBackButton';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommentAnalyzer />} />
        <Route path="/go-back" element={<GoBackButton />} />
      </Routes>
    </Router>
  );
};

export default App;