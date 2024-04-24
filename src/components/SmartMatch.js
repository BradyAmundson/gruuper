// Import Firestore
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getUser } from '../firebase/firestoreService';


// Initialize Firestore
const db = getFirestore();

async function fetchStudentData(studentId) {
    const docRef = doc(db, "students", studentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.error("No such document!");
        return null;
    }
}

async function calculateMatchScore(student1Id, student2Id) {
    const student1 = await getUser(student1Id);
    const student2 = await getUser(student2Id);
    console.log('student1', student1);
    console.log('student2', student2);
    let score = 0;
    console.log(`Calculating match score between ${student1.firstName} and ${student2.firstName}:`);

    if (student1.major === student2.major) {
        score += 1;
        console.log(`Major match found: ${student1.major}`);
    } else {
        console.log(`No major match: ${student1.major} vs ${student2.major}`);
    }

    if (student1.classYear === student2.classYear) {
        score += 1;
        console.log(`Class Year match found: ${student1.classYear}`);
    } else {
        console.log(`No Class Year match: ${student1.classYear} vs ${student2.classYear}`);
    }

    if (student1.nightOrMorning === student2.nightOrMorning) {
        score += 1;
        console.log(`Night or Morning preference match found: ${student1.nightOrMorning}`);
    } else {
        console.log(`No Night or Morning preference match: ${student1.nightOrMorning} vs ${student2.nightOrMorning}`);
    }

    if (student1.socialPreference === student2.socialPreference) {
        score += 1;
        console.log(`Social Preference match found: ${student1.socialPreference}`);
    } else {
        console.log(`No Social Preference match: ${student1.socialPreference} vs ${student2.socialPreference}`);
    }

    if (student1.deadlineBehavior === student2.deadlineBehavior) {
        score += 1;
        console.log(`Deadline Behavior match found: ${student1.deadlineBehavior}`);
    } else {
        console.log(`No Deadline Behavior match: ${student1.deadlineBehavior} vs ${student2.deadlineBehavior}`);
    }

    console.log(`Total score for ${student1.firstName} and ${student2.firstName}: ${score}`);
    return score;
}


// New function to optimize groups based on match scores
export async function optimizeGroups(members, groupSize) {
    console.log("Starting optimization of groups...");
    console.log("Members:", members);
    // const members = await Promise.all(passedMembers.map(id => getUser(id)));
    const scores = {};

    console.log(`Total members: ${members.length}, Desired group size: ${groupSize}`);

    // Calculate all pairwise scores
    console.log("Calculating pairwise compatibility scores...");
    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            console.log(`Calculating score between ${members[i]} and ${members[j]}...`);
            const score = await calculateMatchScore(members[i], members[j]);
            scores[`${members[i]}-${members[j]}`] = score;
            scores[`${members[j]}-${members[i]}`] = score; // Symmetric
            console.log(`Score between ${members[i]} and ${members[j]}: ${score}`);
        }
    }

    // Log calculated scores
    console.log("All calculated scores:", scores);

    // Sort pairs by score in descending order for optimal group formation
    const sortedPairs = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    console.log("Pairs sorted by compatibility scores:");

    sortedPairs.forEach(pair => {
        console.log(`${pair[0]}: ${pair[1]}`);
    });

    const groups = new Map();
    const memberToGroup = new Map();

    // Greedily form groups based on highest scores
    console.log("Forming groups based on highest compatibility scores...");
    for (const [pair, score] of sortedPairs) {
        const [member1, member2] = pair.split('-');
        if (!memberToGroup.has(member1) && !memberToGroup.has(member2)) {
            if (groups.size < Math.ceil(members.length / groupSize)) {
                const groupId = groups.size;
                groups.set(groupId, [member1, member2]);
                memberToGroup.set(member1, groupId);
                memberToGroup.set(member2, groupId);
                console.log(`New group ${groupId} formed with ${member1} and ${member2} (Score: ${score})`);
            }
        } else if (memberToGroup.has(member1) && !memberToGroup.has(member2)) {
            const groupId = memberToGroup.get(member1);
            if (groups.get(groupId).length < groupSize) {
                groups.get(groupId).push(member2);
                memberToGroup.set(member2, groupId);
                console.log(`Adding ${member2} to group ${groupId} with ${member1} (Score: ${score})`);
            }
        } else if (!memberToGroup.has(member1) && memberToGroup.has(member2)) {
            const groupId = memberToGroup.get(member2);
            if (groups.get(groupId).length < groupSize) {
                groups.get(groupId).push(member1);
                memberToGroup.set(member1, groupId);
                console.log(`Adding ${member1} to group ${groupId} with ${member2} (Score: ${score})`);
            }
        }
    }

    // Handle remaining members who are not yet assigned to any group
    console.log("Assigning remaining members to groups...");
    members.forEach(member => {
        if (!memberToGroup.has(member)) {
            let placed = false;
            for (let [groupId, groupMembers] of groups) {
                if (groupMembers.length < groupSize) {
                    groupMembers.push(member);
                    memberToGroup.set(member, groupId);
                    placed = true;
                    console.log(`Placing ${member} into existing group ${groupId}`);
                    break;
                }
            }
            if (!placed) {
                const newGroupId = groups.size;
                groups.set(newGroupId, [member]);
                memberToGroup.set(member, newGroupId);
                console.log(`Creating new group ${newGroupId} for remaining member ${member.id}`);
            }
        }
    });

    // Final output of group divisions
    console.log("Final group divisions:");
    groups.forEach((group, groupId) => {
        console.log(`Group ${groupId}: ${group.join(', ')}`);
    });

    console.log("Converting groups to object entries...");
    const groupEntries = Object.fromEntries(groups);
    console.log("Final group entries:", groupEntries);
    return groupEntries;
}