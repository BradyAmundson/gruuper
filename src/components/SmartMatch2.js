export const smartMatchGroups = async (students, groupSize) => {
    try {
        const response = await fetch('https://smartmatch-vmlt.onrender.com/api/smartmatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ students, group_size: groupSize }),
        });

        if (!response.ok) {
            throw new Error('Failed to get groupings from SmartMatch 2.0 API');
        }

        const data = await response.json();

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

        return groups;
    } catch (error) {
        console.error('Error with SmartMatch 2.0 grouping:', error);
        return null;
    }
};
