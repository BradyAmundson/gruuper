// SignUpModal.js
import React, { useState } from "react";
import Modal from "react-modal";
import { SignUpEmail } from "../firebase/authService";
import Button from "@mui/material/Button";

const labelStyles = {
  content: {
    maxWidth: "25rem",
    margin: "0 auto",
    height: "fit-content",
  },
};

const inputStyles = {
  content: {
    width: "95%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
};

const SignUpModal = ({ isOpen, onRequestClose }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState("");
  const [error, setError] = useState("");

  const customStyles = {
    content: {
      backgroundColor: "white",
      maxWidth: "25rem",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      height: "fit-content",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const handleNext = () => {
    switch (step) {
      case 1:
        if (!userType) {
          setError("Please select a user type before proceeding.");
        } else {
          setError("");
          setStep((prevStep) => prevStep + 1);
        }
        break;
      case 2:
        if (!firstName || !lastName) {
          setError("Please enter your first and last name before proceeding.");
        } else {
          setError("");
          setStep((prevStep) => prevStep + 1);
        }
        break;
      default:
        setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
    setError("");
  };

  const handleDone = () => {
    // You can now use firstName, lastName, and userType to create the account
    console.log("Account created:", { firstName, lastName, userType });

    // Close the modal or perform any other necessary actions
    onRequestClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      {step === 1 && (
        <Step1
          userType={userType}
          setUserType={setUserType}
          onNext={handleNext}
          error={error}
        />
      )}
      {step === 2 && (
        <Step2
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          onNext={handleNext}
          onBack={handleBack}
          error={error}
        />
      )}
      {step === 3 && (
        <Step3
          firstName={firstName}
          lastName={lastName}
          userType={userType}
          onBack={handleBack}
          onDone={handleDone}
        />
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Modal>
  );
};

const Step1 = ({ userType, setUserType, onNext, error }) => {
  return (
    <div>
      <h2>Step 1: User Type</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <Button
          variant={userType === "Student" ? "contained" : "outlined"}
          onClick={() => setUserType("Student")}
          style={{ marginRight: "1.50rem", width: "10rem" }}
        >
          Student
        </Button>
        <h3> OR </h3>
        <Button
          variant={userType === "Professor" ? "contained" : "outlined"}
          onClick={() => setUserType("Professor")}
          style={{ marginLeft: "1.50rem", width: "10rem" }}
        >
          Professor
        </Button>
      </div>
      <button onClick={onNext}>Next &gt;</button>
    </div>
  );
};

const Step2 = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  onNext,
  onBack,
  error,
}) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <h2>Step 2: Personal Information</h2>
      <div style={{ display: "grid" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              width: "95%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "95%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </label>
      </div>
      <div style={{ display: "flex", justifyContent: "spaced-evently" }}>
        <button onClick={onBack}>&lt; Back</button>
        <button onClick={onNext}>Next &gt;</button>
      </div>
    </div>
  );
};

const Step3 = ({ firstName, lastName, userType, onDone, onBack }) => {
  return (
    <div>
      <h2>Step 3: Create Account</h2>
      <p>
        {firstName} {lastName}, {userType}
      </p>
      <SignUpEmail
        firstName={firstName}
        lastName={lastName}
        userType={userType}
      />
      <button onClick={onBack}>&lt; Back</button>
    </div>
  );
};

export default SignUpModal;
