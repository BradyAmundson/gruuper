// SignUpModal.js
import React, { useState } from "react";
import Modal from "react-modal";
import { SignUpEmail } from "../firebase/authService";
import Button from "@mui/material/Button";

const SignUpModal = ({ isOpen, onRequestClose }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState("");
  const [error, setError] = useState("");

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
      <Button
        variant={userType === "Student" ? "contained" : "outlined"}
        onClick={() => setUserType("Student")}
      >
        Student
      </Button>
      <Button
        variant={userType === "Professor" ? "contained" : "outlined"}
        onClick={() => setUserType("Professor")}
      >
        Professor
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
    <div>
      <h2>Step 2: Personal Information</h2>
      <label>
        First Name:
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>
      <label>
        Last Name:
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={onBack}>&lt; Back</button>
      <button onClick={onNext}>Next &gt;</button>
    </div>
  );
};

const Step3 = ({ firstName, lastName, userType, onDone, onBack }) => {
  return (
    <div>
      <h2>Step 3: Create Account</h2>
      <p>First Name: {firstName}</p>
      <p>Last Name: {lastName}</p>
      <p>User Type: {userType}</p>
      <SignUpEmail
        firstName={firstName}
        lastName={lastName}
        userType={userType}
      />
      <button onClick={onBack}>&lt; Back</button>
    </div>
  );
};

const customStyles = {
  content: {
    width: "50%",
    height: "70%",
    margin: "auto",
  },
};

export default SignUpModal;
