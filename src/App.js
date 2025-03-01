import { useState } from "react";
import UserForm from "./components/UserForm";  // Your existing form page
import MatchingScreen from "./components/MatchingScreen";  // Your existing matching screen
import ChatScreen from "./components/ChatScreen";  // New chat UI

function App() {
  const [screen, setScreen] = useState("form");

  return (
    <>
      {screen === "form" && <UserForm onSubmit={() => setScreen("matching")} />}  {/* Fixed here */}
      {screen === "matching" && <MatchingScreen onMatchFound={() => setScreen("chat")} />}
      {screen === "chat" && <ChatScreen />}
    </>
  );
}

export default App;
