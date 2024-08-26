import React, { useState } from "react";
import Modal from "react-modal";
import { forgotPassword } from "../firebase/authService";

const ForgotPasswordModal = ({ isOpen, onRequestClose }) => {
  const customStyles = {
    content: {
      width: "30rem",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      height: "fit-content",
      borderRadius: "20px",
      border: "5px solid #6db3f2",
      padding: "2rem",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const inputStyles = {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
  };

  const buttonStyles = {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#6db3f2",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const messageStyles = {
    color: "green",
    marginBottom: "1rem",
    textAlign: "center",
  };

  const errorStyles = {
    color: "red",
    marginBottom: "1rem",
    textAlign: "center",
  };

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async () => {
    try {
      await forgotPassword(email);
      setMessage("Password reset email sent! Please check your inbox.");
      setError("");
    } catch (error) {
      setError("Failed to send password reset email. Please try again.");
      setMessage("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Forgot Password"
      ariaHideApp={false}
    >
      <h2>Forgot Password</h2>
      {message && (
        <div>
          <div style={messageStyles}>{message}</div>
          <button onClick={onRequestClose} style={buttonStyles}>
            Close
          </button>
        </div>
      )}
      {message !== "Password reset email sent! Please check your inbox." && (
        <div>
          {error && <div style={errorStyles}>{error}</div>}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyles}
          />
          <button onClick={handlePasswordReset} style={buttonStyles}>
            Send Reset Email
          </button>
        </div>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
