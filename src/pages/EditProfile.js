import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import { updateUser, getUser } from "../firebase/firestoreService";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function EditProfile() {
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    ethnicity: "",
    major: "",
    classYear: "",
    availability: [],
    description: "",
    idealGroup: "",
  });
  const [calendarDate, setCalendarDate] = useState(new Date(1970, 1, 4));
  const [openDialog, setOpenDialog] = useState(false);

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.firstName = userData.firstName ? "" : "First name is required";
    tempErrors.lastName = userData.lastName ? "" : "Last name is required";
    tempErrors.age = userData.age ? "" : "Age is required";
    tempErrors.gender = userData.gender ? "" : "Gender is required";
    tempErrors.ethnicity = userData.ethnicity ? "" : "Ethnicity is required";
    tempErrors.major = userData.major ? "" : "Major is required";
    tempErrors.classYear = userData.classYear ? "" : "Class year is required";
    tempErrors.availability = userData.availability.length > 0 ? "" : "At least one availability slot is required";
    tempErrors.description = userData.description ? "" : "Description is required";
    tempErrors.idealGroup = userData.idealGroup ? "" : "Ideal group description is required";

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

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

  const handleSave = async () => {
    if (validateForm()) {
      try {
        await updateUser(userId, userData);
        alert("Profile and questionnaire updated successfully!");
        navigate("/profile");
      } catch (error) {
        console.error("Error updating document: ", error);
        alert("Error updating profile. Please try again.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleAvailabilitySelect = ({ start, end }) => {
    const day = moment(start).format("dddd");
    const startTime = moment(start).format("HH:mm");
    const endTime = moment(end).format("HH:mm");

    setUserData((prevUserData) => ({
      ...prevUserData,
      availability: [...(prevUserData.availability || []), { day, startTime, endTime }],
    }));
  };

  const handleAvailabilityRemove = (event) => {
    const day = moment(event.start).format("dddd");
    const startTime = moment(event.start).format("HH:mm");
    const endTime = moment(event.end).format("HH:mm");

    setUserData((prevUserData) => ({
      ...prevUserData,
      availability: prevUserData.availability.filter(
        (slot) => slot.day !== day || slot.startTime !== startTime || slot.endTime !== endTime
      ),
    }));
  };

  const events = userData.availability.map((slot) => {
    if (!slot.startTime || !slot.endTime) {
      return null;
    }

    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);

    const start = moment(calendarDate).day(slot.day).set({ hour: startHour, minute: startMinute });
    const end = moment(calendarDate).day(slot.day).set({ hour: endHour, minute: endMinute });

    return {
      title: `${slot.startTime} - ${slot.endTime}`,
      start: start.toDate(),
      end: end.toDate(),
    };
  }).filter(event => event !== null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const paperStyle = {
    padding: "2rem",
    margin: "2rem auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "600px",
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

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h5" gutterBottom style={headingStyle}>
          Edit Profile
        </Typography>

        <TextField
          label="First Name"
          variant="outlined"
          value={userData.firstName}
          onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
          margin="normal"
          fullWidth
          required
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={userData.lastName}
          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
          margin="normal"
          fullWidth
          required
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
        <TextField
          label="Age"
          variant="outlined"
          type="number"
          value={userData.age}
          onChange={(e) => setUserData({ ...userData, age: e.target.value })}
          margin="normal"
          fullWidth
          required
          error={!!errors.age}
          helperText={errors.age}
        />
        <TextField
          label="Gender"
          variant="outlined"
          value={userData.gender}
          onChange={(e) =>
            setUserData({ ...userData, gender: e.target.value })
          }
          margin="normal"
          fullWidth
          required
          error={!!errors.gender}
          helperText={errors.gender}
        />
        <TextField
          label="Ethnicity"
          variant="outlined"
          value={userData.ethnicity}
          onChange={(e) =>
            setUserData({ ...userData, ethnicity: e.target.value })
          }
          margin="normal"
          fullWidth
          required
          error={!!errors.ethnicity}
          helperText={errors.ethnicity}
        />
        <TextField
          label="Major"
          variant="outlined"
          value={userData.major}
          onChange={(e) => setUserData({ ...userData, major: e.target.value })}
          margin="normal"
          fullWidth
          required
          error={!!errors.major}
          helperText={errors.major}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="class-year-label">Class Year</InputLabel>
          <Select
            labelId="class-year-label"
            id="class-year"
            value={userData.classYear}
            onChange={(e) => setUserData({ ...userData, classYear: e.target.value })}
          >
            <MenuItem value="Freshman">Freshman</MenuItem>
            <MenuItem value="Sophomore">Sophomore</MenuItem>
            <MenuItem value="Junior">Junior</MenuItem>
            <MenuItem value="Senior">Senior</MenuItem>
            <MenuItem value="Graduate">Graduate</MenuItem>
          </Select>
          {errors.classYear && <Typography color="error">{errors.classYear}</Typography>}
        </FormControl>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "2rem" }}>
          <Typography
            variant="h6"
            style={{ ...headingStyle, fontSize: "1.2rem", marginBottom: "1rem" }}
          >
            Estimated Week-to-Week Availability*
          </Typography>
          <IconButton onClick={handleOpenDialog} style={{ color: "#1e5799" }}>
            <HelpOutlineIcon />
          </IconButton>
        </div>

        <div style={{ height: 400, width: "100%", marginBottom: "2rem" }}>
          <Calendar
            localizer={localizer}
            events={events}
            selectable
            defaultView="week"
            views={['week']}
            toolbar={false}
            step={30}
            timeslots={2}
            onSelectSlot={handleAvailabilitySelect}
            onSelectEvent={handleAvailabilityRemove}
            style={{ height: "100%" }}
            min={new Date(1970, 1, 1, 7, 0, 0)} // Start time 7 AM
            max={new Date(1970, 1, 1, 23, 0, 0)} // End time 10 PM
            date={calendarDate} // Controlled date prop
            onNavigate={(date) => setCalendarDate(date)} // Update state on navigation
          />
        </div>

        {errors.availability && <Typography color="error">{errors.availability}</Typography>}


        <Typography variant="body1" gutterBottom style={{ textAlign: "left", marginBottom: "1rem" }}>
          <strong>Describe yourself in a few sentences, including anything from personality to interests:</strong>
        </Typography>
        <TextField
          label="Describe yourself"
          variant="outlined"
          multiline
          rows={4}
          value={userData.description}
          onChange={(e) =>
            setUserData({ ...userData, description: e.target.value })
          }
          margin="normal"
          fullWidth
          required
          error={!!errors.description}
          helperText={errors.description}
        />

        <Typography variant="body1" gutterBottom style={{ textAlign: "left", marginTop: "2rem", marginBottom: "1rem" }}>
          <strong>In a few sentences, describe your ideal group for teamwork in class settings:</strong>
        </Typography>
        <TextField
          label="Describe your ideal group"
          variant="outlined"
          multiline
          rows={4}
          value={userData.idealGroup}
          onChange={(e) =>
            setUserData({ ...userData, idealGroup: e.target.value })
          }
          margin="normal"
          fullWidth
          required
          error={!!errors.idealGroup}
          helperText={errors.idealGroup}
        />

        <Grid container spacing={2} style={{ marginTop: "3rem" }}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCancel}
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
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
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
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>How to Use the Availability Calendar</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Click and drag to select the time slots on the calendar to indicate your availability during the week.
            <br /><br />
            You can remove any previously selected time slots by clicking on them.
            <br /><br />
            *At least one availability slot is required.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EditProfile;
