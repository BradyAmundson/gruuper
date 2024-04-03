import logo from "./logo.svg";
import "./pages/styles/App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Classroom from "./pages/Classroom";
import SignUp from "./pages/Signup";
import AuthPage from "./pages/AuthPage";
import Classrooms from "./pages/Classrooms";
import {
  SignIn,
  SignOut,
  useAuthentication,
  SignInPhone,
  SignInEmail,
} from "./firebase/authService";
import { useNavigate, Navigate } from "react-router-dom";

function App() {
  const user = useAuthentication();
  console.log(user);
  return (
    <Router>
      <div className="App">
        <Navbar />
        {!user ? (
          <AuthPage />
        ) : (
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/classrooms" element={<Classrooms />} />
            <Route path="/" element={<Home />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
