import React from "react";
import { useEffect, useState } from "react";
import {
  getDocument,
  createClass,
  getGroups,
  getUser,
} from "../firebase/firestoreService";
import { useLocation } from "react-router-dom";
import "./styles/classroom.css";

const Class = () => {
  // const roomId = localStorage.getItem("roomId");
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState([]);
  const [groups, setGroups] = useState(Object);
  const [memberNames, setMemberNames] = useState([]);
  const [numberOfGroups, setNumberOfGroups] = useState(1);

  useEffect(() => {
    getDocument("classrooms", roomId).then(setClassroom);
  }, [groups]);

  useEffect(() => {
    const fetchMemberNames = async () => {
      const newMemberNames = await Promise.all(
        classroom?.members?.map(async (member) => {
          const fetchedUser = await getUser(member);
          return `${fetchedUser["firstName"]} ${fetchedUser["lastName"]}`;
        }) || []
      );
      setMemberNames(newMemberNames);
    };

    fetchMemberNames();
  }, [classroom]);

  const handleRandomizeGroups = () => {
    getGroups(roomId, setGroups, memberNames, numberOfGroups);
  };

  return (
    <div>
      <h1>Classroom: {roomId}</h1>
      <label>
        Number of Groups:
        <input
          type="number"
          value={numberOfGroups}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 1) {
              setNumberOfGroups(value);
            }
          }}
        />
      </label>
      <button onClick={handleRandomizeGroups}>Randomize Groups</button>
      {classroom.groups &&
        Object.entries(classroom.groups).map(([key, group], index) => (
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
        {memberNames.sort().map((member) => (
          <li key={member}>{member}</li>
        ))}
      </div>
    </div>
  );
};

export default Class;
