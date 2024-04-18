import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDocument, getUser } from "../firebase/firestoreService";
import "./styles/studentView.css";

const StudentView = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId"); // Current user's ID

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedClassroom = await getDocument("classrooms", roomId);
        if (fetchedClassroom) {
          setClassroom(fetchedClassroom);
          await organizeMembers(fetchedClassroom);
        } else {
          console.error("No classroom data found for roomId:", roomId);
        }
      } catch (error) {
        console.error("Error fetching classroom data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [roomId]);

  const organizeMembers = async (classroom) => {
    if (!classroom.members || !classroom.groups) {
      console.error("Invalid classroom data structure:", classroom);
      return;
    }

    // Fetch full details for each member
    const membersDetails = await Promise.all(
      classroom.members.map((memberId) => getUser(memberId))
    );

    // Set all members list
    const allMembersList = membersDetails.map((member) =>
      member ? `${member.firstName} ${member.lastName}` : "Unknown Member"
    );
    setAllMembers(allMembersList);

    // Identify the group for the current user
    const userGroupKey = Object.keys(classroom.groups).find((key) =>
      classroom.groups[key].includes(userId)
    );

    if (!userGroupKey) {
      setGroupMembers([]);
      return;
    }

    const userGroupMembers = classroom.groups[userGroupKey].map((id) => {
      const member = membersDetails.find((member) => member.id === id);
      return member
        ? `${member.firstName} ${member.lastName}`
        : "Unknown Member";
    });

    setGroupMembers(userGroupMembers);
  };

  if (loading) {
    return <div className="student-view-container">Loading...</div>;
  }

  return (
    <div>
      <h1>{classroom?.className || "Classroom Name"}</h1>
      <div className="student-view-container">
        <div className="group-box">
          <h2>Your Group</h2>
          <ul className="member-list">
            {groupMembers.length ? (
              groupMembers.map((name, index) => (
                <li key={index} className="member-item">
                  <span className="member-name">{name}</span>
                </li>
              ))
            ) : (
              <li className="member-item">
                You are not assigned to any group.
              </li>
            )}
          </ul>
        </div>
        <div className="classroom-box">
          <h2>Classroom Roster</h2>
          <ul className="member-list">
            {allMembers.map((name, index) => (
              <li key={index} className="member-item">
                <span className="member-name">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
