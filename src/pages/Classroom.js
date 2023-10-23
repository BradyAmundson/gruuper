import React from "react";
import { useEffect, useState } from "react";
import { getDocument, createClass, getGroups } from "../firebase/firestoreService";
import { useLocation } from "react-router-dom";
import "./styles/classroom.css"


const Class = () => {
  // const roomId = localStorage.getItem("roomId");
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState([]);
  const [groups, setGroups] = useState(Object)

  useEffect(() => {
    getDocument("classrooms", roomId).then(setClassroom);
  }, [groups]);

  return (
    <div>
      <h1>Classroom: {roomId}</h1>
      <button onClick={() => getGroups(roomId, setGroups)}>Randomize Groups</button>
      {classroom.groups && Object.entries(classroom.groups).map(([key, group], index) => (
        <div id="Groups">
          <h3>Group {index + 1}</h3>
          <ul>
            {group.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </div>
      ))}
      <div id="Members">
        <h3>Classroom Members</h3>
        {classroom?.members?.sort().map((member) => (
          <li key={member}>{member}</li>
        ))}
      </div>
    </div>
  );
};

export default Class;
