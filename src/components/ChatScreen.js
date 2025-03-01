import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

const ChatScreen = ({ chatId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const stompClientRef = useRef(null);

  // Initialize WebSocket Connection
  useEffect(() => {
    const client = new Client({
        brokerURL: "ws://localhost:8080/ws-chat",
        reconnectDelay: 5000, // Auto-reconnect on disconnect
        debug: (msg) => console.log("[WebSocket Debug]", msg), // Debugging logs
    
        onConnect: () => {
            console.log("✅ Connected to WebSocket");
            client.subscribe(`/user/queue/chat.${chatId}`, (message) => {
                console.log("📩 Received Message:", message.body);
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });
        },
    
        onStompError: (frame) => {
            console.error("🚨 STOMP Error:", frame.headers["message"]);
        },
    
        onWebSocketClose: () => {
            console.warn("⚠️ WebSocket disconnected. Attempting to reconnect...");
        }
    });
    
    client.activate();
    

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [chatId]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message Function
  const sendMessage = () => {
    if (input.trim() === "" || !stompClientRef.current || !stompClientRef.current.connected) {
      console.error("WebSocket is not connected yet.");
      return;
    }
  
    const message = {
      chatId,
      sender: userId,
      recipient: "other_user_id", // Replace dynamically
      content: input,
    };
  
    // Add message to UI instantly
    setMessages([...messages, message]);
  
    // Send message via WebSocket
    stompClientRef.current.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(message),
    });
  
    // Clear input field
    setInput("");
  };  

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 p-4">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-fit px-4 py-2 rounded-lg text-white break-words ${
              msg.sender === userId ? "bg-blue-500 self-end" : "bg-gray-600 self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex items-center p-2 bg-white/10 rounded-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 bg-transparent text-white focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;