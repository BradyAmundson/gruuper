import "./pages/styles/App.css";
import IRBConsentPopUp from "./components/IRBConsentPopUp";
import React, { useEffect, useState } from "react";
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
import Support from "./pages/Support";
import { useAuthentication } from "./firebase/authService";
import { getUser } from "./firebase/firestoreService";

function App() {
  const user = useAuthentication();
  const [showModal, setShowModal] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  useEffect(() => {
    if (user) {
      getUser(user.uid).then((doc) => {
        setUserConsent(doc?.consent !== undefined);
        setShowModal(true);
      });
    }
  }, [user]);

  const handleModalClose = async () => {
    setShowModal(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        {!user ? (
          <AuthPage />
        ) : (
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/classrooms" element={<Classrooms />} />
            <Route path="/student-view" element={<StudentView />} />
            <Route path="/" element={<Home />} />
          </Routes>
        )}
        {!userConsent && (
          <IRBConsentPopUp
            isOpen={showModal}
            onRequestClose={handleModalClose}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
