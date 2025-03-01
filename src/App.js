import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserForm from "./components/UserForm"; // User input form
import MatchingScreen from "./components/MatchingScreen"; // Matching screen
import ChatScreen from "./components/ChatScreen"; // Chat UI

function App() {
  return (
    <Routes>
      {/* Route for the user input form (home page) */}
      <Route path="/" element={<UserForm />} />
      
      {/* Route for the matching screen */}
      <Route path="/matching" element={<MatchingScreen />} />
      
      {/* Route for the chat screen */}
      <Route path="/chat" element={<ChatScreen />} />
    </Routes>
  );
}

export default App;
