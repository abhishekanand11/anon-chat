import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const MatchingScreen = () => {
  const navigate = useNavigate();

  const randomUsers = ["Alice", "Bob", "Charlie", "David", "Eve"];

  useEffect(() => {
    // Simulate matchmaking delay (e.g., 3 seconds)
    const timer = setTimeout(() => {
      handleMatchSuccess();
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const handleMatchSuccess = () => {
    // Generate chat ID
    const chatId = uuidv4();
  
    // Simulating matched user and current user
    const matchedUser = {
      name: randomUsers[Math.floor(Math.random() * randomUsers.length)],
      id: uuidv4(), // Generate unique ID for matched user
    };
  
    const currentUser = {
      name: "Current User", // Replace with actual user info if available
      id: uuidv4(), // Generate unique ID for current user
    };
  
    console.log("User:", currentUser.id, "Matched with:", matchedUser.name, "Chat ID:", chatId);
  
    // ✅ Pass both `user` (currentUser) and `recipient` (matchedUser)
    navigate("/chat", { state: { chatId, user: currentUser, recipient: matchedUser } });
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-lg">Finding a match...</p>
    </div>
  );
};

export default MatchingScreen;
