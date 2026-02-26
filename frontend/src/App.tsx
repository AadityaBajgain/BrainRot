import React from "react";

// Importing necessary dependencies
import { Route, Routes, BrowserRouter, Link } from "react-router-dom";

// Importing the pages
import Home from "./pages/Home";
import Create from "./pages/Create";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <nav className="flex flex-row justify-between items-center">
        <img src="/Brainrot.webp" alt="brain rot icon" className="w-[10rem]" fetchPriority="high"/>
        <Link to="/create">Create</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
