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
      borderRadius: "20px",
      border: "5px solid #6db3f2",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const headingStyle = {
    margin: "00px",
    padding: "0px",
    borderRadius: "8px",
    fontSize: "28px",
    color: "black",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundImage: "linear-gradient(145deg, #000, #000)",
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      {/* <h2 style={headingStyle}>Log In</h2> */}
      <SignInWithEmail />
    </Modal>
  );
};

export default SignInModal;
