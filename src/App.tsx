import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { CommentAnalyzer } from './components/CommentAnalyzer';
import GoBackButton from './components/GoBackButton';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <GoBackButton />
        <Switch>
          <Route path="/" component={CommentAnalyzer} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;