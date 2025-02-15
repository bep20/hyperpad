import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { PadLayout } from './components/layout';
import { Wallet } from './components/wallet';
import './style/styles.css';
import './style/antd.less';

const App = () => (
  <Router>
    <Wallet>
      <PadLayout />
    </Wallet>
  </Router>
);
export default App;
