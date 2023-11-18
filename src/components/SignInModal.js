// SignInModal.js
import React from "react";
import Modal from "react-modal";
import { SignIn, SignInPhone, SignInWithEmail } from "../firebase/authService";

const SignInModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Sign Into Gruuper</h2>
      <SignInWithEmail />
    </Modal>
  );
};

export default SignInModal;
