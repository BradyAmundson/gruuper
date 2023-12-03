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
          zIndex: 1,
          color: "white",
        }}
      >
        <div
          style={{
            height: "250px",
            position: "relative",
            zIndex: 2,
            color: "white",
          }}
        >
          <Typography
            variant="h2"
            style={{
              fontSize: "64px",
              lineHeight: "1.2",
              margin: 0,
              textAlign: "left",
              paddingLeft: "10px",
              width: "350px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
            }}
          >
            Welcome to Gruuper!
          </Typography>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
          flexDirection: "column",
          alignItems: "center",
          padding: "35px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          maxWidth: "400px",
          margin: "auto",
          zIndex: 0,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4">Join or Create a Class</Typography>
        <form onSubmit={joinClass} style={{ marginTop: "20px", width: "100%" }}>
          <TextField
            id="roomId"
            label="Class Code"
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
          color="lightBlue"
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
