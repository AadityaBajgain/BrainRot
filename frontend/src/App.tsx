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
        <img src="/Brainrot.svg" alt="brain rot icon" className="w-[10rem]"/>
        <div className="flex gap-10">
          <Link to="/">Home</Link>
          <Link to="/create">Create</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
