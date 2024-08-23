import React from "react";
import "./styles/Login.css";

const Login = () => {

  return (
    <div className="container">
      <div className="phone">
        <header>Gruuper</header>
        <div className="options">
          <div className="option">Create Room</div>
          <button>Create</button>
          <div className="option">Join Room</div>
        </div>
      </div>
      <div className="notebook">
        <header>Room</header>
        <div className="join">
          <input placeholder="Room name" />
          <input placeholder="Room code" />
          <button>Join</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
