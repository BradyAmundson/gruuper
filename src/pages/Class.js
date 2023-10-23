import React from "react";
import { useEffect, useState } from "react";
import { getDocument, createClass } from "../firebase/firestoreService";
import { useLocation } from "react-router-dom";

const Class = () => {
  // const roomId = localStorage.getItem("roomId");
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState([]);

  useEffect(() => {
    getDocument("classrooms", roomId).then(setClassroom);
  }, []);

  return (
    <div>
      <h1>Lobby</h1>
      <h2>{roomId}</h2>
      {classroom?.members?.map((member) => (
        <h3 key={member}>{member}</h3>
      ))}
    </div>
  );
};

export default Class;
