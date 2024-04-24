import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getDocument, getUser } from "../firebase/firestoreService";
import "./styles/studentView.css";
import PersonIcon from "@mui/icons-material/Person";


const calculateCloudParts = (name, cloudWidth) => {
    const nameLength = name.length;
    // Base proportion of the cloud width for the 'before' and 'after' elements
    const baseWidthFactor = 0.15; // Adjusted base factor for width
    const baseHeightFactor = 0.10; // Proportion of the cloud width for height

    // Increment factor per character (scaled down to maintain visual consistency at varying name lengths)
    const incrementWidthFactor = 0.01; // Scaled down width increment
    const incrementHeightFactor = 0.06; // Scaled down height increment

    // Calculate dimensions
    const beforeWidth = Math.max(20, cloudWidth * (baseWidthFactor + nameLength * incrementWidthFactor));
    const beforeHeight = Math.max(10, cloudWidth * baseHeightFactor);
    const afterWidth = Math.max(30, cloudWidth * (baseWidthFactor + nameLength * incrementWidthFactor * 1.5));
    const afterHeight = Math.max(15, cloudWidth * (baseHeightFactor * 1.5));

    return {
        beforeWidth,
        beforeHeight,
        afterWidth,
        afterHeight
    };
};


const StudentView = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const roomId = query.get("roomId");
    const userId = localStorage.getItem("userId");
    const [classroom, setClassroom] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cloudWidth, setCloudWidth] = useState(0);
    const cloudRef = useRef(null);


    useEffect(() => {
        if (cloudRef.current) {
            setCloudWidth(cloudRef.current.offsetWidth); // Get the width after the component mounts
        }
    }, []);

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
            <h1 className="classroom-header">{classroom?.className || "Classroom Name"}</h1>
            <div className="student-view-container">
                <div className="group-box">
                    <h2 className="group-title">Your Group:</h2>
                    <ul className="group-member-list">
                        {groupMembers.length ? (
                            groupMembers.map((name, index) => {
                                const cloudWidth = 200;
                                const { beforeWidth, beforeHeight, afterWidth, afterHeight } = calculateCloudParts(name, cloudWidth);
                                console.log(`Member: ${name}, Before Width: ${beforeWidth}, Before Height: ${beforeHeight}, After Width: ${afterWidth}, After Height: ${afterHeight}`);

                                return (
                                    <li
                                        key={index}
                                        className="member-item-group"
                                        style={{ animationDuration: `${Math.random() * 3 + 1}s` }}
                                    >
                                        <div ref={cloudRef} className="cloud" style={{
                                            '--beforeWidth': `${beforeWidth}px`,
                                            '--beforeHeight': `${beforeHeight}px`,
                                            '--afterWidth': `${afterWidth}px`,
                                            '--afterHeight': `${afterHeight}px`,
                                        }}>
                                            <span className="member-name">{name}</span>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="member-item">You are not assigned to any group yet!</li>
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
