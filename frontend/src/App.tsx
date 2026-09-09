import React from "react";

// Importing necessary dependencies
import { Route, Routes, BrowserRouter, Link } from "react-router-dom";

// Importing the pages
import Home from "./pages/Home";
import Create from "./pages/Create";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <nav className="mb-12 flex flex-row items-center justify-between border-b border-black/10 pb-4">
       <Link to="/">
          <img src="/Brainrot.webp" alt="brain rot icon" className="w-[10rem]" fetchPriority="high"/>
       </Link>
        <Link to="/create" className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold transition hover:border-black hover:bg-black hover:text-white">Create</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
