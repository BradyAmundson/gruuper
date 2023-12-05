import React from "react";
import Modal from "react-modal";
import { SignIn, SignInPhone, SignInWithEmail } from "../firebase/authService";

const SignInModal = ({ isOpen, onRequestClose }) => {
  const customStyles = {
    content: {
      maxWidth: "25rem",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      height: "fit-content",
      borderRadius: "10px",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <h2>Sign Into Gruuper</h2>
      <SignInWithEmail />
    </Modal>
  );
};

export default SignInModal;
