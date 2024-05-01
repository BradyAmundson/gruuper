import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signOut,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUser, getUser } from "./firestoreService";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

auth.useDeviceLanguage();

const StyledButton = ({ onClick, children }) => (
  <Button
    variant="contained"
    onClick={onClick}
    style={{
      fontFamily: "Arial",
      margin: "20px 0rem 0rem 0rem",
      background: "linear-gradient(145deg, #6db3f2, #1e5799)",
      color: "white",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px",
      padding: "5px 20px",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </Button>
);

export function SignIn() {
  const handleSignIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider());
  };
  return <StyledButton onClick={handleSignIn}>Sign In</StyledButton>;
}

export function SignUpPhone() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSendCode = async () => {
    try {
      const appVerifier = new RecaptchaVerifier(auth, "recaptcha-container");
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
    } catch (error) {
      console.error("Error sending verification code:", error.message);
      setError(error.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      if (!confirmationResult) {
        console.error("Confirmation result is missing.");
        return;
      }

      const credential = await confirmationResult.confirm(code);
      return credential;
    } catch (error) {
      console.error("Error verifying code:", error.message);
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Phone Number Authentication</h2>
      <label>
        Phone Number:
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </label>
      <div id="recaptcha-container"></div>
      <StyledButton onClick={handleSendCode}>
        Send Verification Code
      </StyledButton>

      <label>
        Verification Code:
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </label>
      <StyledButton onClick={handleVerifyCode}>Verify Code</StyledButton>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export function SignUpEmail({
  firstName,
  lastName,
  userType,
  email,
  password,
}) {
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      // Proceed with sign-up
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setLoading(true);
      await sendEmailVerification(userCredential.user).then(() => {
        alert("Email sent (Check Spam folder)");
        setLoading(false);
      });

      createUser(firstName, lastName, auth.currentUser.uid, userType);
      signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError(error.message);
    }
  };

  return (
    <div>
      <div style={{ marginTop: "10px", width: "100%", textAlign: "center" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      {loading ? (
        <div>Loading</div>
      ) : (
        <button
          onClick={handleSignUp}
          style={{
            background: "linear-gradient(145deg, #6db3f2, #1e5799)",
            color: "white",
            borderRadius: "0.75rem",
            cursor: "pointer",
            fontSize: "2.85rem",
            padding: "0.75rem 2.25rem",
            margin: "0.8rem",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s, background-color 0.3s",
            display: "inline-flex",
          }}
        >
          Sign Up
        </button>
      )}
    </div>
  );
}

export function SignInWithEmail() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!auth.currentUser.emailVerified) {
        alert("Must Verify Email (Check Spam folder)");
        signOut(auth);
        return;
      }
      const userData = await getUser(userCredential.user.uid);
      localStorage.setItem("firstName", userData.firstName);
      localStorage.setItem("lastName", userData.lastName);
      localStorage.setItem("userType", userData.userType);
      localStorage.setItem("userId", userCredential.user.uid);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <div className="input-group" style={{ marginBottom: "15px" }}>
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
              minWidth: "19rem",
            }}
          />
        </label>
      </div>
      <div className="input-group">
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
          />
        </label>
      </div>
      <div
        className="sign-in-button-div"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <StyledButton onClick={handleSignIn}>Log In</StyledButton>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export function SignOut() {
  const handleSignOut = () => {
    signOut(auth);
    localStorage.clear();
  };
  return (
    <div style={{ paddingRight: "10px" }}>
      <Button
        variant="contained"
        onClick={handleSignOut}
        style={{
          marginTop: "1rem",
          transition: "transform 0.2s",
          background: "linear-gradient(145deg, #6db3f2, #1e5799)",
          color: "white",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "16px",
          padding: "12px 36px",
          margin: "10px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}

export function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (oldPassword === newPassword) {
        setError("New password must be different from old password.");
        return;
      }
      await signInWithEmailAndPassword(auth, user.email, oldPassword);

      updatePassword(user, newPassword).then(() => {
        alert("Password updated successfully!");
      });
      setOldPassword("");
      setNewPassword("");
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "auto",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "28px",
          color: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundImage: "linear-gradient(145deg, #6db3f2, #1e5799)",
          display: "inline",
        }}
      >
        Reset Password
      </h2>
      <form onSubmit={handleResetPassword}>
        <div style={{ marginBottom: "20px", marginTop: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Old Password:
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            New Password:
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 36px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(145deg, #6db3f2, #1e5799)",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Reset Password
        </button>
        {error && (
          <div style={{ marginTop: "10px", color: "red" }}>{error}</div>
        )}
      </form>
    </div>
  );
}

export function useAuthentication() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      user ? setUser(user) : setUser(null);
    });
  }, []);
  return user;
}
