import React from "react";
import GroupRandomizer from "../components/GroupRandomizer";
import PhotoBanner from "../components/PhotoBanner";
import Typography from "@mui/material/Typography";

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
      <div>
        <PhotoBanner />
      </div>
      <div
        style={{
          height: "250px",
          position: "relative",
          zIndex: 2,
          color: "white",
        }}
      >
        <p
          style={{
            fontSize: "64px",
            lineHeight: "1.2",
            margin: 0,
            paddingLeft: "10px",
            width: "350px",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)", // Adjust the shadow values
          }}
        >
          Welcome to Gruuper!
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          maxWidth: "400px",
          margin: "auto",
        }}
      >
        <Typography variant="h4">Join or Create a Class</Typography>
        <form onSubmit={joinClass} style={{ marginTop: "20px", width: "100%" }}>
          <TextField
            id="roomId"
            label="Insert class code here"
            type="search"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Join a Class
          </Button>
        </form>
        <Typography variant="h6" style={{ margin: "20px 0" }}>
          or
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={createClass}
          fullWidth
        >
          Create a Class
        </Button>
      </div>
    </div>
  );
}

export default Home;
