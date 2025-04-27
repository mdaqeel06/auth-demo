import React from "react";
import { AppProvider } from "./appContext";
import Layout from "./Layout";
import "./App.css";
import { BrowserRouter as Router } from 'react-router-dom';

const App = () => {
  return (

    <AppProvider>
      <Router>
      <Layout />
      </Router>
    </AppProvider>
  );
};

export default App;
