import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { updateUser, getUser } from "../firebase/firestoreService";

function EditProfile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    major: "",
    classYear: "",
    nightOrMorning: "",
    socialPreference: "",
    deadlineBehavior: "",
    unavailableTimes: [],
  });

  // Fetch user profile information from FireBase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUserData = await getUser(userId);
        setUserData(currentUserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Handle selecting/deselecting time slots
  const toggleTimeSlot = (day, slot) => {
    const timeSlotId = `${day}-${slot}`;
    setUserData((prevUserData) => {
      const updatedUnavailableTimes = prevUserData.unavailableTimes.includes(
        timeSlotId
      )
        ? prevUserData.unavailableTimes.filter((time) => time !== timeSlotId)
        : [...prevUserData.unavailableTimes, timeSlotId];

      return {
        ...prevUserData,
        unavailableTimes: updatedUnavailableTimes,
      };
    });
  };

  const handleSave = async () => {
    // Include logic to validate form data
    try {
      await updateUser(userId, userData);
      alert("Profile and questionnaire updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const generateTimeSlots = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
      const amPm = hour < 12 ? "AM" : "PM";
      slots.push(`${hourFormatted}:00 ${amPm}`);
      slots.push(`${hourFormatted}:30 ${amPm}`);
    }
    return days.map((day) => (
      <div key={day}>
        <Typography variant="subtitle1">{day}</Typography>
        {slots.map((slot) => {
          const timeSlotId = `${day}-${slot}`;
          return (
            <Button
              key={timeSlotId}
              variant={
                userData.unavailableTimes.includes(timeSlotId)
                  ? "contained"
                  : "outlined"
              }
              onClick={() => toggleTimeSlot(day, slot)}
              size="small"
              style={{
                margin: "2px",
                transition: "background-color 0.3s, color 0.3s",
              }}
              sx={{
                "&:hover": {
                  backgroundColor: userData.unavailableTimes.includes(
                    timeSlotId
                  )
                    ? "#1e5799"
                    : "#6db3f2",
                  color: "white",
                },
              }}
            >
              {slot}
            </Button>
          );
        })}
      </div>
    ));
  };

  const paperStyle = {
    padding: "2rem",
    margin: "2rem auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "500px",
  };

  const headingStyle = {
    margin: "10px",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "28px",
    color: "transparent",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundImage: "linear-gradient(145deg, #6db3f2, #1e5799)",
    display: "inline",
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h5" gutterBottom style={headingStyle}>
          Edit Profile
        </Typography>

        <TextField
          label="First Name"
          variant="outlined"
          value={userData.firstName}
          onChange={(e) =>
            setUserData({ ...userData, firstName: e.target.value })
          }
          margin="normal"
          fullWidth
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={userData.lastName}
          onChange={(e) =>
            setUserData({ ...userData, lastName: e.target.value })
          }
          margin="normal"
          fullWidth
        />

        {/* Questionnaire Section */}
        <Typography
          variant="h6"
          style={{ ...headingStyle, margin: "2rem 0 1rem", fontSize: "1.2rem" }}
        >
          SmartMatch Questionnaire
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel id="major-label">Major</InputLabel>
          <Select
            labelId="major-label"
            id="major"
            value={userData.major}
            label="Major"
            onChange={(e) =>
              setUserData({ ...userData, major: e.target.value })
            }
          >
            <MenuItem value={"Computer Science"}>Computer Science</MenuItem>
            <MenuItem value={"Engineer"}>Other Engineering Major</MenuItem>
            <MenuItem value={"Minor"}>Computer Science Minor</MenuItem>
            <MenuItem value={"Other"}>Non-STEM Major/Minor</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="class-year-label">Class Year</InputLabel>
          <Select
            labelId="class-year-label"
            id="class-year"
            value={userData.classYear}
            label="Class Year"
            onChange={(e) =>
              setUserData({ ...userData, classYear: e.target.value })
            }
          >
            <MenuItem value={"Freshman"}>Freshman</MenuItem>
            <MenuItem value={"Sophomore"}>Sophomore</MenuItem>
            <MenuItem value={"Junior"}>Junior</MenuItem>
            <MenuItem value={"Senior"}>Senior</MenuItem>
            <MenuItem value={"Graduate"}>Graduate</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="time-of-day-preference-label">
            Are you more of a night or morning person?
          </InputLabel>
          <Select
            labelId="time-of-day-preference-label"
            id="time-of-day-preference"
            value={userData.nightOrMorning}
            label="Are you a night owl or an early bird?"
            onChange={(e) =>
              setUserData({ ...userData, nightOrMorning: e.target.value })
            }
          >
            <MenuItem value={"Night Owl"}>Night Owl</MenuItem>
            <MenuItem value={"Early Bird"}>Early Bird</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="social-preference-label">
            How do you prefer to do your school work?
          </InputLabel>
          <Select
            labelId="social-preference-label"
            id="social-preference"
            value={userData.socialPreference}
            label="How do you prefer to do your school work?"
            onChange={(e) =>
              setUserData({ ...userData, socialPreference: e.target.value })
            }
          >
            <MenuItem value={"Solo"}>I want to work alone.</MenuItem>
            <MenuItem value={"Open"}>
              Solo mostly, but I'm open to a team.
            </MenuItem>
            <MenuItem value={"Group"}>Teamwork makes the dreamwork!</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="deadline-behavior-label">
            Give it to me straight: How are you with deadlines?
          </InputLabel>
          <Select
            labelId="deadline-behavior-label"
            id="deadline-behavior"
            value={userData.deadlineBehavior}
            label="Give it to me straight: How are you with deadlines?"
            onChange={(e) =>
              setUserData({ ...userData, deadlineBehavior: e.target.value })
            }
          >
            <MenuItem value={"1"}>On it the day it's assigned.</MenuItem>
            <MenuItem value={"2"}>
              Best to spread the work evenly each week.
            </MenuItem>
            <MenuItem value={"3"}>
              30% leading up to it, 70% the night before.
            </MenuItem>
            <MenuItem value={"4"}>
              Biggest 24hr comebacks the world has ever seen.
            </MenuItem>
          </Select>
        </FormControl>

        <Typography
          variant="h6"
          style={{ ...headingStyle, margin: "2rem 0 1rem", fontSize: "1.2rem" }}
        >
          Select Weekly Commitments
        </Typography>
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {generateTimeSlots()}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "3rem",
            gap: "1rem",
          }}
        >
          <Button
            variant="outlined"
            style={{
              background: "white",
              color: "#1e5799",
              borderRadius: "12px",
              padding: "12px 36px",
              transition: "background-color 0.3s, color 0.3s",
            }}
            sx={{
              "&:hover": {
                backgroundColor: "#6db3f2",
                color: "white",
              },
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            style={{
              background: "linear-gradient(145deg, #6db3f2, #1e5799)",
              color: "white",
              borderRadius: "12px",
              padding: "12px 36px",
              transition: "background-color 0.3s, color 0.3s",
            }}
            sx={{
              "&:hover": {
                background: "linear-gradient(145deg, #1e5799, #6db3f2)",
                color: "white",
              },
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </Paper>
    </Container>
  );
}

export default EditProfile;
