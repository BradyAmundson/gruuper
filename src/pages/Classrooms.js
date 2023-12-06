import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUser, getDocument } from "../firebase/firestoreService";

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const user = await getUser(userId);
        setLoading(true);
        if (user && user.classroomCodes) {
          const classroomDetails = await Promise.all(
            user.classroomCodes.map(async (code) => {
              const classroom = await getDocument("classrooms", code);
              const userGroupNames = await getUserGroupNames(classroom, userId);
              return {
                code,
                name: classroom.className,
                userGroup: userGroupNames,
              };
            })
          );

          setClassrooms(classroomDetails);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const getUserGroupNames = async (classroom, userId) => {
    if (!classroom || !classroom.groups) {
      return [];
    }

    const groupsArray = Object.values(classroom.groups);

    const userGroupNames = await Promise.all(
      groupsArray.map(async (group) => {
        const user = await getUser(group[0]); // Assuming group is an array of user IDs
        return `${user?.firstName || ""} ${user?.lastName || ""}`;
      })
    );

    return userGroupNames;
  };

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Your Classrooms
      </Typography>
      {classrooms.length === 0 ? (
        loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : (
          <Typography variant="body1">No classrooms found.</Typography>
        )
      ) : (
        <List>
          {classrooms.map(({ code, name, userGroup }) => (
            <ListItem key={code} disablePadding>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate(`/classroom?roomId=${code}`)}
                style={{ borderRadius: 5, marginBottom: "1rem" }}
              >
                <ListItemText
                  primary={`Classroom: ${name ? name : "Unnamed"} @ ${code}`}
                  secondary={
                    userGroup.length > 0 &&
                    localStorage.getItem("userType") === "student"
                      ? `Your Group: ${userGroup.join(", ")}`
                      : localStorage.getItem("userType") === "Professor"
                      ? "Click to view classroom"
                      : "No group assigned"
                  }
                />
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default Classrooms;
