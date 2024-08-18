// SignUpModal.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { SignUpEmail } from "../firebase/authService";
import Button from "@mui/material/Button";
import "../pages/styles/SignUpModal.css";
import { TextField } from "@mui/material";

const SignUpModal = ({ isOpen, onRequestClose }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState("default");
  const [email, setEmail] = useState("");
  const [secondEmail, setSecondEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [error, setError] = useState("");

  const customStyles = {
    content: {
      backgroundColor: "white",
      width: "25rem",
      minHeight: "15rem",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      height: "fit-content",
      borderRadius: "20px",
      border: "5px solid #6db3f2",
      padding: "30px",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  useEffect(() => {
    handleNext();
  }, [userType]);

  const handleNext = () => {
    switch (step) {
      case 1:
        if (userType === "default") {
          setError("");
        } else if (!userType) {
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
    // Check for blank fields
    if (!email || !secondEmail || !password || !secondPassword) {
      setError("All fields are required.");
      return;
    }

    // Check if emails match
    if (email !== secondEmail) {
      setError("Emails do not match.");
      return;
    }

    // Check if passwords match
    if (password !== secondPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Close the modal or perform any other necessary actions
    onRequestClose();
  };

  return (
    <Modal
      class="signUpModal"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
    >
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
          email={email}
          setEmail={setEmail}
          secondEmail={secondEmail}
          setSecondEmail={setSecondEmail}
          password={password}
          setPassword={setPassword}
          secondPassword={secondPassword}
          setSecondPassword={setSecondPassword}
          onBack={handleBack}
          onDone={handleDone}
        />
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Modal>
  );
};

const Step1 = ({ userType, setUserType, onNext }) => {
  return (
    <div>
      <h2 class="slide-title">Step 1: User Type</h2>
      <div class="user-type-button-container">
        <Button
          variant={userType === "Student" ? "contained" : "outlined"}
          onClick={() => {
            setUserType("Student");
          }}
          style={{
            marginRight: "1.50rem",
            width: "10rem",
          }}
        >
          Student
        </Button>
        <h3> OR </h3>
        <Button
          variant={userType === "Professor" ? "contained" : "outlined"}
          onClick={() => setUserType("Professor")}
          style={{
            marginLeft: "1.50rem",
            width: "10rem",
          }}
        >
          Professor
        </Button>
      </div>
      {userType !== "default" && (
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <span style={{ margin: "20px 0px 20px 30px" }}> </span>
          <button class="next-step" onClick={onNext}>
            Next &gt;
          </button>
        </div>
      )}
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
}) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <h2 class="slide-title">Step 2: Your Name</h2>
      <div style={{ display: "grid" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <TextField
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            id="roomId"
            label="First Name"
            type="search"
            variant="standard"
            fullWidth
            margin="normal"
            style={{
              minWidth: "24rem",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <TextField
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            id="last-name"
            label="Last Name"
            type="search"
            variant="standard"
            fullWidth
            margin="large"
            style={{
              minWidth: "24rem",
            }}
          />
        </label>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <button
          class="prev-step"
          onClick={onBack}
          style={{
            margin: "20px 0px 0px 0px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#1f618d",
          }}
        >
          &lt; Back
        </button>
        <button
          class="next-step"
          onClick={onNext}
          style={{
            margin: "20px 0px 0px 0px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#1f618d",
          }}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

const Step3 = ({
  firstName,
  lastName,
  userType,
  email,
  setEmail,
  secondEmail,
  setSecondEmail,
  password,
  setPassword,
  secondPassword,
  setSecondPassword,
  onDone,
  onBack,
}) => {
  return (
    <div>
      <h2 class="slide-title">Step 3: Create Account</h2>
      <p style={{ fontStyle: "italic", color: "#ccc" }}>
        {firstName} {lastName}, {userType}
      </p>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            label="Email"
            type="search"
            variant="standard"
            fullWidth
            margin="large"
            style={{
              minWidth: "24rem",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <TextField
            value={secondEmail}
            onChange={(e) => setSecondEmail(e.target.value)}
            id="second-email"
            label="Confirm Email"
            type="search"
            variant="standard"
            fullWidth
            margin="large"
            style={{
              minWidth: "24rem",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            label="Password"
            type="password"
            variant="standard"
            fullWidth
            margin="large"
            style={{
              minWidth: "24rem",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <TextField
            value={secondPassword}
            onChange={(e) => setSecondPassword(e.target.value)}
            id="second-password"
            label="Confirm Password"
            type="password"
            variant="standard"
            fullWidth
            margin="large"
            style={{
              minWidth: "24rem",
            }}
          />
        </label>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SignUpEmail
          firstName={firstName}
          lastName={lastName}
          userType={userType}
          email={email}
          secondEmail={secondEmail}
          password={password}
          secondPassword={secondPassword}
        />
        <button
          onClick={onBack}
          class="prev-step"
          style={{
            color: "white",
            borderRadius: "0.75rem",
            cursor: "pointer",
            fontSize: "2rem",
            padding: "0.5rem 2rem",
            margin: "0.625rem",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s, background-color 0.3s",
            display: "inline-flex",
          }}
        >
          &lt; Back
        </button>
      </div>
    </div>
  );
};

export default SignUpModal;
