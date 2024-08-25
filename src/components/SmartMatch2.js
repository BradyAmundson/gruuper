import { generateToken } from "../api/tokenFetch";

export const smartMatchGroups = async (students, groupSize) => {

    try {
        console.log('Starting SmartMatch 2.0 grouping...');
        console.log('Students:', students);
        console.log('Group Size:', groupSize);
        console.log('JSON:', JSON.stringify({ students, group_size: groupSize }));
        const token = await generateToken();  // Await the Promise to get the actual token value


        const response = await fetch('https://smartmatch-zj2w.onrender.com/smartmatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ students, group_size: groupSize }),
        });

        console.log('API Response Status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to get groupings from SmartMatch 2.0 API. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response Data:', data);

        // Convert the result to the expected format similar to your randomizeGroups function
        const groups = {};
        data.result.groupings.forEach((group, index) => {
            groups[index] = {
                members: group,
                creationMethod: "SmartMatch 2.0",
                createdAt: new Date().toISOString(),
                logMessages: [`Group created with SmartMatch 2.0 at ${new Date().toISOString()}`],
            };
        });

        console.log('Generated Groups:', groups);
        return groups;
    } catch (error) {
        console.error('Error with SmartMatch 2.0 grouping:', error);
        return null;
    }
};
