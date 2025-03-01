import { Routes, Route } from "react-router-dom";
import UserForm from "./components/UserForm"; // User input form
import MatchingScreen from "./components/MatchingScreen"; // Matching screen
import ChatScreen from "./components/ChatScreen"; // Chat UI

function App() {
  return (
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/matching" element={<MatchingScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
      </Routes>
  );
}

export default App;
