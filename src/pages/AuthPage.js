// AuthPage.js
import React, { useState } from "react";
import SignInModal from "../components/SignInModal";
import SignUpModal from "../components/SignUpModal";
import "./styles/AuthPage.css";

const AuthPage = () => {
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [signUpMethod, setSignUpMethod] = useState("");

  const openSignInModal = () => setSignInModalOpen(true);
  const closeSignInModal = () => setSignInModalOpen(false);

  const openSignUpModal = () => setSignUpModalOpen(true);
  const closeSignUpModal = () => {
    setSignUpModalOpen(false);
    setSignUpMethod(""); // Reset signUpMethod when closing the modal
  };

  return (
    <div>
      <h1 className="title">Welcome to Gruuper!</h1>
      <div className="auth-buttons">
        <button className="sign-in" onClick={openSignInModal}>
          Sign In
        </button>
        <button className="sign-up" onClick={openSignUpModal}>
          Sign Up
        </button>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onRequestClose={closeSignInModal}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onRequestClose={closeSignUpModal}
        signUpMethod={signUpMethod}
      />
    </div>
  );
};

export default AuthPage;
