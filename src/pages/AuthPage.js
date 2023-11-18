// AuthPage.js
import React, { useState } from "react";
import SignInModal from "../components/SignInModal";
import SignUpModal from "../components/SignUpModal";

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
      <h1>Authentication Page</h1>
      <nav>
        <ul>
          <li>
            <button onClick={openSignInModal}>Sign In</button>
          </li>
          <li>
            <button onClick={openSignUpModal}>Sign Up</button>
          </li>
        </ul>
      </nav>

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
