import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signOut,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUser, getUser } from "./firestoreService";
import { Button } from "@mui/material";

auth.useDeviceLanguage();

export function SignIn() {
  return (
    <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
      Sign In
    </button>
  );
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
      console.log("Phone number authenticated:", credential.user);
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
      <button onClick={handleSendCode}>Send Verification Code</button>

      <label>
        Verification Code:
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </label>
      <button onClick={handleVerifyCode}>Verify Code</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export function SignUpEmail({ firstName, lastName, userType }) {
  const [email, setEmail] = useState("");
  const [secondEmail, setSecondEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    try {
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

      // Proceed with sign-up
      await createUserWithEmailAndPassword(auth, email, password);
      createUser(firstName, lastName, auth.currentUser.uid, userType);
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("lastName", lastName);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", auth.currentUser.uid);
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <p style={{ color: "red" }}>{error}</p>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Confirm Email:
        <input
          type="email"
          value={secondEmail}
          onChange={(e) => setSecondEmail(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label>
        Confirm Password:
        <input
          type="password"
          value={secondPassword}
          onChange={(e) => setSecondPassword(e.target.value)}
        />
      </label>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}

export function SignInWithEmail() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await getUser(userCredential.user.uid);
      localStorage.setItem("firstName", userData.firstName);
      localStorage.setItem("lastName", userData.lastName);
      localStorage.setItem("userType", userData.userType);
      localStorage.setItem("userId", userCredential.user.uid);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Email</h2>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button onClick={handleSignIn}>Sign In</button>

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
      {/* Hello, {localStorage.getItem("firstName")} &nbsp; */}
      <Button
        variant="contained"
        color="lightBlue"
        onClick={handleSignOut}
        fullWidth
      >
        Sign Out
      </Button>
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
