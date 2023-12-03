import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getDocument,
  getGroups,
  getUser,
  saveGroups,
} from "../firebase/firestoreService";
import "./styles/classroom.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = {
  MEMBER: "member",
};

const DraggableMember = ({
  name,
  index,
  moveMember,
  setCurrentlyDragging,
  currentlyDragging,
}) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.MEMBER,
    item: { name, index },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      if (isDragging) {
        setCurrentlyDragging(index);
      } else if (currentlyDragging === index) {
        setCurrentlyDragging(null);
      }
      return {
        isDragging: isDragging,
      };
    },
    end: (item, monitor) => {
      setCurrentlyDragging(null);
    },
  }));

  const isCurrentlyBeingDragged = currentlyDragging === index;
  const className = `draggable-item ${
    isCurrentlyBeingDragged ? "dragging-item" : ""
  }`;

  return (
    <li ref={drag} className={className}>
      {name}
    </li>
  );
};

const DroppableGroup = ({
  group,
  index,
  moveMember,
  setCurrentlyDragging,
  currentlyDragging,
  memberNames,
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => moveMember(item.index, index),
  }));
  return (
    <div ref={drop} id="Groups">
      <h3>Group {index + 1}</h3>
      <ul>
        {group.map((user, idx) => (
          <DraggableMember
            key={idx}
            name={
              memberNames.find(
                (member) => member.id === "kqwriyDncNXVMF9Feq3OlDL26ir2"
              )?.name
            }
            index={{ groupIndex: index, memberIndex: idx }}
            moveMember={moveMember}
            setCurrentlyDragging={setCurrentlyDragging}
            currentlyDragging={currentlyDragging}
          />
        ))}
      </ul>
    </div>
  );
};

const NewGroupArea = ({ createNewGroup }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => createNewGroup(item.index),
  }));

  return (
    <div ref={drop} className="new-group-area">
      <p>Drop here to create a new group</p>
    </div>
  );
};

const Classroom = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState([]);
  const [groups, setGroups] = useState(Object);
  const [memberNames, setMemberNames] = useState([]);
  const [groupSize, setGroupSize] = useState(1);
  const [currentlyDragging, setCurrentlyDragging] = useState(null);
  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClassroom = await getDocument("classrooms", roomId);
        setClassroom(fetchedClassroom);
        setClassName(fetchedClassroom?.className || ""); // Use optional chaining

        const members = fetchedClassroom?.members || [];
        const newMemberNames = await Promise.all(
          members.map(async (member) => {
            const fetchedUser = await getUser(member);
            return {
              id: member,
              name: `${fetchedUser?.firstName || ""} ${
                fetchedUser?.lastName || ""
              }`,
            };
          })
        );
        setMemberNames(newMemberNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [roomId]);

  const handleRandomizeGroups = async () => {
    await getGroups(roomId, setGroups, memberNames, groupSize);
    const fetchedClassroom = await getDocument("classrooms", roomId);

    const members = fetchedClassroom?.members || [];
    const newMemberNames = await Promise.all(
      members.map(async (member) => {
        const fetchedUser = await getUser(member);
        return {
          id: member,
          name: `${fetchedUser?.firstName || ""} ${
            fetchedUser?.lastName || ""
          }`,
        };
      })
    );

    setMemberNames(newMemberNames);
    setClassroom(fetchedClassroom);
  };

  const saveGroupsToFirestore = () => {
    setClassroom((prevClassroom) => {
      const currentGroups = prevClassroom.groups;
      const newGroups = {};

      // Filter out empty groups and reassign keys
      let newGroupIndex = 0;
      Object.keys(currentGroups).forEach((groupKey) => {
        if (currentGroups[groupKey].length > 0) {
          newGroups[newGroupIndex] = currentGroups[groupKey];
          newGroupIndex++;
        }
      });

      // Now newGroups contains only non-empty groups
      // Perform your save operation here (e.g., saving to a backend)
      saveGroups(roomId, newGroups, className);
      // Return the updated classroom object without empty groups
      return { ...prevClassroom, groups: newGroups };
    });
    window.location.reload();
  };

  const moveMember = (fromIndexes, toGroupIndex) => {
    setClassroom((prevClassroom) => {
      // Deep cloning the groups to avoid direct state mutation
      const newGroups = { ...prevClassroom.groups };

      // Extracting the member's name from the source group
      const fromGroupIndex = fromIndexes.groupIndex;
      const fromMemberIndex = fromIndexes.memberIndex;
      const memberName = newGroups[fromGroupIndex][fromMemberIndex];

      // Remove the member from the original group
      newGroups[fromGroupIndex].splice(fromMemberIndex, 1);

      // Add the member to the destination group
      newGroups[toGroupIndex].push(memberName);

      // Return the updated classroom object with new groups
      return { ...prevClassroom, groups: newGroups };
    });
  };

  const createNewGroup = (memberIndex) => {
    setClassroom((prevClassroom) => {
      const newGroups = { ...prevClassroom.groups };
      const fromGroupIndex = memberIndex.groupIndex;
      const fromMemberIndex = memberIndex.memberIndex;
      const memberName = newGroups[fromGroupIndex][fromMemberIndex];

      // Remove member from the original group
      newGroups[fromGroupIndex].splice(fromMemberIndex, 1);

      // Create a new group with the member
      const newGroupIndex = Object.keys(newGroups).length;
      newGroups[newGroupIndex] = [memberName];

      return { ...prevClassroom, groups: newGroups };
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>
          Classroom: {roomId} {classroom.className}
        </h1>
        <button
          className="randomize-groups-button"
          onClick={handleRandomizeGroups}
        >
          Randomize Groups
        </button>
        <button className="save-groups-button" onClick={saveGroupsToFirestore}>
          Save
        </button>
        <label>
          Group Size:
          <input
            type="number"
            value={groupSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1) {
                setGroupSize(value);
              }
            }}
          />
        </label>
        <label>
          Class Name:
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </label>
        <div className="grid-container">
          {classroom.groups &&
            Object.entries(classroom.groups).map(([key, group], index) => (
              <DroppableGroup
                key={index}
                group={group}
                index={index}
                moveMember={moveMember}
                setCurrentlyDragging={setCurrentlyDragging}
                currentlyDragging={currentlyDragging}
                memberNames={memberNames}
              />
            ))}
          {currentlyDragging !== null && (
            <NewGroupArea createNewGroup={createNewGroup} />
          )}
        </div>

        <div id="Members">
          <h3>Classroom Members</h3>
          {memberNames.sort().map((member) => (
            <li key={member.name}>{member.name}</li>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Classroom;
