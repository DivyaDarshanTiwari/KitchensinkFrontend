import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import SignUp from "./components/signup";
import Login from "./components/login";
import Dashboard from "./components/dashboard";

function App() {

  return (
    <Router >
        <Routes>
          <Route exact="true" path="/" element={<Login/>}></Route>
          <Route path="/signup" element={<SignUp/>}></Route>
          <Route path="/dashboard" element={<Dashboard/>}></Route>
        </Routes>
    </Router>
  );
}

export default App
