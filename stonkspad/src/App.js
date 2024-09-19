import React from "react";
import { PadLayout } from "./components/layout";
import { BrowserRouter as Router } from "react-router-dom";
import { Wallet } from "./components/wallet";
import "./style/styles.css";
console.log("process env", process.env);
const App = () => {
  return (
    <Router>
      <Wallet>
        <PadLayout />
      </Wallet>
    </Router>
  );
};
export default App;
