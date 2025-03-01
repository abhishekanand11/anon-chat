import { useEffect } from "react";

const MatchingScreen = ({ onMatchFound }) => {
  useEffect(() => {
    // Simulate matchmaking delay (e.g., 3 seconds)
    const timer = setTimeout(() => {
      onMatchFound();  // Move to chat screen
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onMatchFound]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-lg">Finding a match...</p>
    </div>
  );
};

export default MatchingScreen;
