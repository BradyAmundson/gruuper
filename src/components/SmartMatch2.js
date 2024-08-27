import { generateToken } from "../api/tokenFetch";

export const smartMatchGroups = async (students, groupSize) => {
    try {
        const preToken = await generateToken();
        const token = JSON.parse(preToken).access_token;

        const response = await fetch(
            "https://smartmatch-zj2w.onrender.com/smartmatch",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ students, group_size: groupSize }),
            }
        );


        if (!response.ok) {
            throw new Error(
                `Failed to get groupings from SmartMatch 2.0 API. Status: ${response.status}`
            );
        }

        const data = await response.json();

        // Convert the result to the expected format similar to your randomizeGroups function
        const groups = {};
        data.result.groupings.forEach((group, index) => {
            groups[index] = {
                members: group,
                creationMethod: "SmartMatch 2.0",
                createdAt: new Date().toISOString(),
                logMessages: [
                    `Group created with SmartMatch 2.0 at ${new Date().toISOString()}`,
                ],
            };
        });

        return groups;
    } catch (error) {
        console.error("Error with SmartMatch 2.0 grouping:", error);
        return null;
    }
};

const raw = JSON.stringify({
    students: [
        [
            200,
            "I focus on backend development, working with databases, APIs, and server-side logic to build scalable applications.",
            "I’m looking for a frontend developer to create user interfaces and a DevOps specialist to manage deployment and scalability.",
            [
                {
                    day: "Monday",
                    startTime: "09:00",
                    endTime: "12:00",
                },
                {
                    day: "Thursday",
                    startTime: "13:00",
                    endTime: "16:00",
                },
                {
                    day: "Friday",
                    startTime: "10:00",
                    endTime: "14:00",
                },
            ],
        ],
        [
            201,
            "I love web development, especially working with JavaScript and React. I enjoy building interactive and responsive web applications.",
            "I prefer working with a backend developer to manage server-side tasks and a creative designer to ensure a polished user interface.",
            [
                {
                    day: "Monday",
                    startTime: "13:00",
                    endTime: "16:00",
                },
                {
                    day: "Tuesday",
                    startTime: "09:00",
                    endTime: "11:30",
                },
                {
                    day: "Thursday",
                    startTime: "14:00",
                    endTime: "18:00",
                },
            ],
        ],
        [
            202,
            "Cybersecurity fascinates me. I'm always looking into the latest vulnerabilities and security protocols to protect data.",
            "I’m looking to pair with a backend developer to secure the server-side and someone in AI/ML to work on security algorithms.",
            [
                {
                    day: "Monday",
                    startTime: "08:00",
                    endTime: "12:00",
                },
                {
                    day: "Wednesday",
                    startTime: "10:00",
                    endTime: "14:00",
                },
                {
                    day: "Friday",
                    startTime: "15:00",
                    endTime: "19:00",
                },
            ],
        ],
        [
            203,
            "I have a strong interest in data science and big data analytics. I enjoy working with large datasets and extracting meaningful insights.",
            "I’d like to team up with an AI/ML specialist for model development and a software engineer for implementing our findings.",
            [
                {
                    day: "Tuesday",
                    startTime: "13:00",
                    endTime: "17:00",
                },
                {
                    day: "Thursday",
                    startTime: "08:30",
                    endTime: "11:30",
                },
                {
                    day: "Friday",
                    startTime: "09:00",
                    endTime: "12:00",
                },
            ],
        ],
        [
            204,
            "I'm really into software engineering, particularly in agile methodologies and version control systems like Git.",
            "I work well with a frontend developer for user interfaces and a DevOps specialist to ensure smooth deployment.",
            [
                {
                    day: "Monday",
                    startTime: "11:00",
                    endTime: "13:00",
                },
                {
                    day: "Wednesday",
                    startTime: "14:00",
                    endTime: "17:00",
                },
                {
                    day: "Thursday",
                    startTime: "09:00",
                    endTime: "12:00",
                },
            ],
        ],
        [
            205,
            "Game development is my passion. I love designing and coding games, especially using Unity and Unreal Engine.",
            "I’d love to work with a creative designer for visuals and a backend developer to manage game mechanics.",
            [
                {
                    day: "Tuesday",
                    startTime: "10:00",
                    endTime: "14:00",
                },
                {
                    day: "Wednesday",
                    startTime: "12:00",
                    endTime: "16:00",
                },
                {
                    day: "Friday",
                    startTime: "08:00",
                    endTime: "11:00",
                },
            ],
        ],
        [
            206,
            "I'm passionate about artificial intelligence and machine learning. I spend a lot of time working on neural networks and deep learning models.",
            "I want to lead the group and collaborate with a data scientist who can handle data analysis and a backend developer who can integrate our models into the system.",
            [
                {
                    day: "Monday",
                    startTime: "10:00",
                    endTime: "14:00",
                },
                {
                    day: "Wednesday",
                    startTime: "09:00",
                    endTime: "12:00",
                },
                {
                    day: "Friday",
                    startTime: "13:00",
                    endTime: "17:00",
                },
            ],
        ],
    ],
    group_size: 3,
});

export const SmartMatch = async (students, groupSize) => {
    try {
        const requestBody = JSON.stringify({
            students: students,
            group_size: groupSize,
        });

        const token = await generateToken();
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const response = await fetch(
            "https://smartmatch-zj2w.onrender.com/smartmatch",
            {
                method: "POST",
                headers: myHeaders,
                body: requestBody,
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error smart matching", error);
        throw error;
    }
};
