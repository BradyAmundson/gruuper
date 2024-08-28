import React, { useState } from "react";
import Modal from "react-modal";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

const ResendVerificationModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResendVerification = async () => {
    try {
      // Sign the user in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      //   console.log("user", user);

      if (!user.emailVerified) {
        // Send the verification email
        await sendEmailVerification(user);
        setMessage("Verification email sent! Please check your inbox.");
        setError("");
      } else {
        setError("Email is already verified.");
      }
      auth.signOut();
    } catch (error) {
      setError(
        "Error sending verification email. Please check your credentials and try again."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Resend Verification Email"
      ariaHideApp={false}
      style={{
        content: {
          width: "400px",
          height: "350px",
          margin: "auto",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <h2>Resend Verification Email</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginBottom: "40px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleResendVerification}
        style={{
          background: "linear-gradient(145deg, #6db3f2, #1e5799)",
          color: "white",
          borderRadius: "12px",
          marginBottom: "30px",

          padding: "10px 20px",
          cursor: "pointer",
          width: "200px",
        }}
      >
        Resend Verification Email
      </button>
      {message && (
        <p style={{ color: "green", marginTop: "20px" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
    </Modal>
  );
};

export default ResendVerificationModal;
