import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const MatchingScreen = () => {
    const navigate = useNavigate();

    // Ensure user has a unique ID stored in localStorage
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        currentUser = { id: uuidv4(), name: "User " + Math.floor(Math.random() * 1000) };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    useEffect(() => {
        // Simulate matchmaking delay (e.g., 3 seconds)
        const timer = setTimeout(() => {
            console.log("Calling handleMatchSuccess...");
            handleMatchSuccess();
        }, 1000);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);

// In MatchingScreen.js, handleMatchSuccess function:

const handleMatchSuccess = async () => {
    try {
      let matched = false;
      console.log("Sending match request for user:", currentUser);

      while (!matched) {
        const userId = currentUser.userId
        console.log("Formatted user id:", userId);

        // Changed to GET and /chat/getMatch with userId as query parameter
        const response = await fetch(`http://localhost:8080/chat/getMatch?userId=${userId}`, {
            method: "GET", // Changed to GET
            headers: { "Content-Type": "application/json" }, // GET request typically doesn't need Content-Type in headers
        });


        if (!response.ok) throw new Error("Failed to fetch match details");

        const matchData = await response.json();

        if (!matchData.matchFound) {
          console.log("Waiting for a match...");
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait before retrying
          continue;
        }

        // If match is found
        const { chatSessionId, user1, user2, matchFound } = matchData;
        const matchedUser = user1.userId === currentUser.userId ? user2 : user1;

        console.log("Match found user: ", currentUser, " rceipient: ", matchedUser, " sessionId: ", chatSessionId);

        matched = true;
        navigate("/chat", { state: { chatSessionId, user: currentUser, recipient: matchedUser } });
      }
    } catch (error) {
      console.error("Error fetching match:", error);
    }
  };      


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-lg">Finding a match...</p>
        </div>
    );
};

export default MatchingScreen;
