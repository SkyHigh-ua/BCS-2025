import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Site from "@/pages/Site";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path=":sitename">
            <Route index element={<Site />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
