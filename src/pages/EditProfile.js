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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { updateUser, getUser } from "../firebase/firestoreService";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function EditProfile() {
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
    try {
      await updateUser(userId, userData);
      alert("Profile and questionnaire updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleAvailabilitySelect = ({ start, end }) => {
    const day = moment(start).format("dddd"); // Get the day of the week
    const startTime = moment(start).format("HH:mm"); // Get the start time in HH:mm format
    const endTime = moment(end).format("HH:mm"); // Get the end time in HH:mm format

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
      return null; // Skip if startTime or endTime is not defined
    }

    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);

    const start = moment().day(slot.day).set({ hour: startHour, minute: startMinute });
    const end = moment().day(slot.day).set({ hour: endHour, minute: endMinute });

    return {
      title: `${slot.startTime} - ${slot.endTime}`,
      start: start.toDate(),
      end: end.toDate(),
    };
  }).filter(event => event !== null); // Filter out null events

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
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={userData.lastName}
          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
          margin="normal"
          fullWidth
        />
        <TextField
          label="Age"
          variant="outlined"
          type="number"
          value={userData.age}
          onChange={(e) => setUserData({ ...userData, age: e.target.value })}
          margin="normal"
          fullWidth
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
        />
        <TextField
          label="Major"
          variant="outlined"
          value={userData.major}
          onChange={(e) => setUserData({ ...userData, major: e.target.value })}
          margin="normal"
          fullWidth
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
        </FormControl>

        <Typography
          variant="h6"
          style={{ ...headingStyle, margin: "2rem 0 1rem", fontSize: "1.2rem" }}
        >
          Weekly Availability
        </Typography>
        <div style={{ height: 400, width: "100%", marginBottom: "2rem" }}>
          <Calendar
            localizer={localizer}
            events={events}
            selectable
            defaultView="week"
            views={['week']}
            toolbar={false} // Disable the toolbar to remove navigation controls
            step={30}
            timeslots={2}
            onSelectSlot={handleAvailabilitySelect}
            onSelectEvent={handleAvailabilityRemove}
            style={{ height: "100%" }}
            min={new Date(1970, 1, 1, 7, 0, 0)} // Start time 7 AM
            max={new Date(1970, 1, 1, 23, 0, 0)} // End time 10 PM
            date={new Date(1970, 1, 4)} // Set a fixed neutral date to represent a week without specific dates
          />
        </div>

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
    </Container>
  );
}

export default EditProfile;



// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { updateUser, getUser } from "../firebase/firestoreService";

// function EditProfile() {
//   const navigate = useNavigate();
//   const userId = localStorage.getItem("userId");
//   const [userData, setUserData] = useState({
//     firstName: "",
//     lastName: "",
//     major: "",
//     classYear: "",
//     nightOrMorning: "",
//     socialPreference: "",
//     deadlineBehavior: "",
//     unavailableTimes: [],
//   });

//   // Fetch user profile information from FireBase
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const currentUserData = await getUser(userId);
//         setUserData(currentUserData);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   // Handle selecting/deselecting time slots
//   const toggleTimeSlot = (day, slot) => {
//     const timeSlotId = `${day}-${slot}`;
//     setUserData((prevUserData) => {
//       const updatedUnavailableTimes = prevUserData.unavailableTimes.includes(
//         timeSlotId
//       )
//         ? prevUserData.unavailableTimes.filter((time) => time !== timeSlotId)
//         : [...prevUserData.unavailableTimes, timeSlotId];

//       return {
//         ...prevUserData,
//         unavailableTimes: updatedUnavailableTimes,
//       };
//     });
//   };

//   const handleSave = async () => {
//     // Include logic to validate form data
//     try {
//       await updateUser(userId, userData);
//       alert("Profile and questionnaire updated successfully!");
//       navigate("/profile");
//     } catch (error) {
//       console.error("Error updating document: ", error);
//       alert("Error updating profile. Please try again.");
//     }
//   };

//   const generateTimeSlots = () => {
//     const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
//     const slots = [];
//     for (let hour = 9; hour <= 21; hour++) {
//       const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
//       const amPm = hour < 12 ? "AM" : "PM";
//       slots.push(`${hourFormatted}:00 ${amPm}`);
//       slots.push(`${hourFormatted}:30 ${amPm}`);
//     }
//     return days.map((day) => (
//       <div key={day}>
//         <Typography variant="subtitle1">{day}</Typography>
//         {slots.map((slot) => {
//           const timeSlotId = `${day}-${slot}`;
//           return (
//             <Button
//               key={timeSlotId}
//               variant={
//                 userData.unavailableTimes.includes(timeSlotId)
//                   ? "contained"
//                   : "outlined"
//               }
//               onClick={() => toggleTimeSlot(day, slot)}
//               size="small"
//               style={{
//                 margin: "2px",
//                 transition: "background-color 0.3s, color 0.3s",
//               }}
//               sx={{
//                 "&:hover": {
//                   backgroundColor: userData.unavailableTimes.includes(
//                     timeSlotId
//                   )
//                     ? "#1e5799"
//                     : "#6db3f2",
//                   color: "white",
//                 },
//               }}
//             >
//               {slot}
//             </Button>
//           );
//         })}
//       </div>
//     ));
//   };

//   const paperStyle = {
//     padding: "2rem",
//     margin: "2rem auto",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     textAlign: "center",
//     maxWidth: "500px",
//   };

//   const headingStyle = {
//     margin: "10px",
//     padding: "10px",
//     borderRadius: "8px",
//     fontSize: "28px",
//     color: "transparent",
//     WebkitBackgroundClip: "text",
//     backgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     backgroundImage: "linear-gradient(145deg, #6db3f2, #1e5799)",
//     display: "inline",
//   };

//   const handleCancel = () => {
//     navigate("/profile");
//   };

//   return (
//     <Container maxWidth="sm">
//       <Paper elevation={3} style={paperStyle}>
//         <Typography variant="h5" gutterBottom style={headingStyle}>
//           Edit Profile
//         </Typography>

//         <TextField
//           label="First Name"
//           variant="outlined"
//           value={userData.firstName}
//           onChange={(e) =>
//             setUserData({ ...userData, firstName: e.target.value })
//           }
//           margin="normal"
//           fullWidth
//         />
//         <TextField
//           label="Last Name"
//           variant="outlined"
//           value={userData.lastName}
//           onChange={(e) =>
//             setUserData({ ...userData, lastName: e.target.value })
//           }
//           margin="normal"
//           fullWidth
//         />

//         {/* Questionnaire Section */}
//         <Typography
//           variant="h6"
//           style={{ ...headingStyle, margin: "2rem 0 1rem", fontSize: "1.2rem" }}
//         >
//           SmartMatch Questionnaire
//         </Typography>
//         <FormControl fullWidth margin="normal">
//           <InputLabel id="major-label">Major</InputLabel>
//           <Select
//             labelId="major-label"
//             id="major"
//             value={userData.major}
//             label="Major"
//             onChange={(e) =>
//               setUserData({ ...userData, major: e.target.value })
//             }
//           >
//             <MenuItem value={"Computer Science"}>Computer Science</MenuItem>
//             <MenuItem value={"Engineer"}>Other Engineering Major</MenuItem>
//             <MenuItem value={"Minor"}>Computer Science Minor</MenuItem>
//             <MenuItem value={"Other"}>Non-STEM Major/Minor</MenuItem>
//           </Select>
//         </FormControl>
//         <FormControl fullWidth margin="normal">
//           <InputLabel id="class-year-label">Class Year</InputLabel>
//           <Select
//             labelId="class-year-label"
//             id="class-year"
//             value={userData.classYear}
//             label="Class Year"
//             onChange={(e) =>
//               setUserData({ ...userData, classYear: e.target.value })
//             }
//           >
//             <MenuItem value={"Freshman"}>Freshman</MenuItem>
//             <MenuItem value={"Sophomore"}>Sophomore</MenuItem>
//             <MenuItem value={"Junior"}>Junior</MenuItem>
//             <MenuItem value={"Senior"}>Senior</MenuItem>
//             <MenuItem value={"Graduate"}>Graduate</MenuItem>
//           </Select>
//         </FormControl>
//         <FormControl fullWidth margin="normal">
//           <InputLabel id="time-of-day-preference-label">
//             Are you more of a night or morning person?
//           </InputLabel>
//           <Select
//             labelId="time-of-day-preference-label"
//             id="time-of-day-preference"
//             value={userData.nightOrMorning}
//             label="Are you a night owl or an early bird?"
//             onChange={(e) =>
//               setUserData({ ...userData, nightOrMorning: e.target.value })
//             }
//           >
//             <MenuItem value={"Night Owl"}>Night Owl</MenuItem>
//             <MenuItem value={"Early Bird"}>Early Bird</MenuItem>
//           </Select>
//         </FormControl>
//         <FormControl fullWidth margin="normal">
//           <InputLabel id="social-preference-label">
//             How do you prefer to do your school work?
//           </InputLabel>
//           <Select
//             labelId="social-preference-label"
//             id="social-preference"
//             value={userData.socialPreference}
//             label="How do you prefer to do your school work?"
//             onChange={(e) =>
//               setUserData({ ...userData, socialPreference: e.target.value })
//             }
//           >
//             <MenuItem value={"Solo"}>I want to work alone.</MenuItem>
//             <MenuItem value={"Open"}>
//               Solo mostly, but I'm open to a team.
//             </MenuItem>
//             <MenuItem value={"Group"}>Teamwork makes the dreamwork!</MenuItem>
//           </Select>
//         </FormControl>
//         <FormControl fullWidth margin="normal">
//           <InputLabel id="deadline-behavior-label">
//             Give it to me straight: How are you with deadlines?
//           </InputLabel>
//           <Select
//             labelId="deadline-behavior-label"
//             id="deadline-behavior"
//             value={userData.deadlineBehavior}
//             label="Give it to me straight: How are you with deadlines?"
//             onChange={(e) =>
//               setUserData({ ...userData, deadlineBehavior: e.target.value })
//             }
//           >
//             <MenuItem value={"1"}>On it the day it's assigned.</MenuItem>
//             <MenuItem value={"2"}>
//               Best to spread the work evenly each week.
//             </MenuItem>
//             <MenuItem value={"3"}>
//               30% leading up to it, 70% the night before.
//             </MenuItem>
//             <MenuItem value={"4"}>
//               Biggest 24hr comebacks the world has ever seen.
//             </MenuItem>
//           </Select>
//         </FormControl>

//         <Typography
//           variant="h6"
//           style={{ ...headingStyle, margin: "2rem 0 1rem", fontSize: "1.2rem" }}
//         >
//           Select Weekly Commitments
//         </Typography>
//         <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
//           {generateTimeSlots()}
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginTop: "3rem",
//             gap: "1rem",
//           }}
//         >
//           <Button
//             variant="outlined"
//             style={{
//               background: "white",
//               color: "#1e5799",
//               borderRadius: "12px",
//               padding: "12px 36px",
//               transition: "background-color 0.3s, color 0.3s",
//             }}
//             sx={{
//               "&:hover": {
//                 backgroundColor: "#6db3f2",
//                 color: "white",
//               },
//             }}
//             onClick={handleCancel}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             style={{
//               background: "linear-gradient(145deg, #6db3f2, #1e5799)",
//               color: "white",
//               borderRadius: "12px",
//               padding: "12px 36px",
//               transition: "background-color 0.3s, color 0.3s",
//             }}
//             sx={{
//               "&:hover": {
//                 background: "linear-gradient(145deg, #1e5799, #6db3f2)",
//                 color: "white",
//               },
//             }}
//             onClick={handleSave}
//           >
//             Save Changes
//           </Button>
//         </div>
//       </Paper>
//     </Container>
//   );
// }

// export default EditProfile;
