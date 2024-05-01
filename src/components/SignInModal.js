import React from "react";
import Modal from "react-modal";
import { SignInWithEmail } from "../firebase/authService";

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
      borderRadius: "20px",
      border: "5px solid #6db3f2",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <SignInWithEmail />
    </Modal>
  );
};

export default SignInModal;
