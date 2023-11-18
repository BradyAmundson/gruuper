import React from "react";
import {
  SignIn,
  useAuthentication,
  SignUpPhone,
  SignUpEmail,
  SignInWithEmail,
} from "../firebase/authService";

const Signup = () => {
  return (
    <div>
      <h1>Signup</h1>
      <SignIn />
      <SignUpPhone />
      <SignUpEmail />
      <SignInWithEmail />
    </div>
  );
};

export default Signup;
