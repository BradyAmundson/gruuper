import "./pages/styles/App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Classroom from "./pages/Classroom";
import AuthPage from "./pages/AuthPage";
import Classrooms from "./pages/Classrooms";
import StudentView from "./pages/StudentView";
import { useAuthentication } from "./firebase/authService";

function App() {
  const user = useAuthentication();
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
            <Route path="/student-view" element={<StudentView />} />
            <Route path="/" element={<Home />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
