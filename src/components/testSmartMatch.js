import { smartMatchGroups } from "./SmartMatch2"; // Import your SmartMatch 2.0 function

// Sample data to simulate student data
const testStudents = [
    {
        id: 200,
        description: "I love web development and enjoy building responsive applications.",
        idealGroup: "I prefer working with a backend developer and a designer.",
        availability: [
            { day: "Monday", startTime: "09:00", endTime: "12:00" },
            { day: "Wednesday", startTime: "10:00", endTime: "13:00" },
        ],
    },
    {
        id: 201,
        description: "I'm focused on backend development, particularly in API design.",
        idealGroup: "I want to work with a frontend developer and a data scientist.",
        availability: [
            { day: "Monday", startTime: "09:00", endTime: "11:00" },
            { day: "Tuesday", startTime: "14:00", endTime: "17:00" },
        ],
    },
    {
        id: 202,
        description: "My passion lies in data science and machine learning.",
        idealGroup: "I'd like to team up with a backend developer and a data engineer.",
        availability: [
            { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
            { day: "Thursday", startTime: "09:00", endTime: "12:00" },
        ],
    },
    {
        id: 203,
        description: "I have a strong background in UI/UX design and frontend development.",
        idealGroup: "I prefer working with a backend developer and a project manager.",
        availability: [
            { day: "Monday", startTime: "13:00", endTime: "16:00" },
            { day: "Friday", startTime: "08:00", endTime: "11:00" },
        ],
    },
    {
        id: 204,
        description: "I'm interested in AI and machine learning.",
        idealGroup: "I'd like to work with a data scientist and a backend developer.",
        availability: [
            { day: "Tuesday", startTime: "09:00", endTime: "12:00" },
            { day: "Friday", startTime: "10:00", endTime: "13:00" },
        ],
    },
];

// Set your desired group size
const groupSize = 2;

async function testSmartMatch() {
    try {

        // Run the SmartMatch 2.0 grouping algorithm
        const result = await smartMatchGroups(testStudents, groupSize);
    } catch (error) {
        console.error("Error in SmartMatch 2.0:", error);
    }
}

// Execute the test
testSmartMatch();
