import React from "react";
import GroupRandomizer from "../components/GroupRandomizer";

import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { navigate, useNavigate } from "react-router-dom";

import { nanoid } from "nanoid";
import { createClassroom, joinClassroom } from "../firebase/firestoreService";

function Home() {
  const navigate = useNavigate();

  const createClass = () => {
    const newRoomId = nanoid(5);
    createClassroom(newRoomId);
    navigate(`/classroom?roomId=${newRoomId}`);
  };

  const joinClass = async (event) => {
    event.preventDefault();
    const roomId = document.getElementById("roomId").value;
    const userId = localStorage.getItem("userId");
    await joinClassroom(roomId, userId);
    navigate(`/classroom?roomId=${roomId}`);
  };

  return (
    <div>
      <h1>Home</h1>
      <h2>Join class here:</h2>
      <form onSubmit={joinClass}>
        <TextField
          id="roomId"
          label="Insert class code here"
          type="search"
          variant="outlined"
        />
        <Button variant="outlined" type="submit">
          Join a Class
        </Button>
      </form>
      <h2>or...</h2>
      <Button variant="outlined" onClick={createClass}>
        Create a Class
      </Button>
    </div>
  );
}

export default Home;
