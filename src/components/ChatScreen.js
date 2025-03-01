import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useLocation, useNavigate } from "react-router-dom";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract chatId, user, and recipient from location.state
  const chatData = location.state || JSON.parse(localStorage.getItem("chatData")) || {};
  const { chatId, user, recipient } = chatData;

  // Function to check if page was reloaded
  const isPageReloaded = () => {
    const entries = window.performance.getEntriesByType("navigation");
    return entries.length > 0 && entries[0].type === "reload";
  };

  // 🔹 Redirect if chatId, user, or recipient is missing
  useEffect(() => {
    if (!chatId || !user?.id || !recipient?.id) {
      console.warn("Chat ID, user, or recipient missing! Redirecting...");
      navigate("/");  // ✅ Now handled inside useEffect
    } else {
        // Save to localStorage
        localStorage.setItem("chatData", JSON.stringify(chatData));
      }
  }, [chatId, user, recipient, navigate]);

  useEffect(() => {
    if (chatId && isPageReloaded()) {
        console.log("Fetching past messages for chat:", chatId);

        fetch(`http://localhost:8080/chat/messages/${chatId}`)
            .then(response => response.json())
            .then(data => {
                console.log("📜 Loaded previous messages:", data);
                setMessages(data) // ✅ Set messages state with fetched data
            })
            .catch(error => console.error("❌ Error fetching messages:", error));
    }
  }, [chatId]);

  // Initialize WebSocket connection only if chatId, user, and recipient exist
  useEffect(() => {
    if (!chatId) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws-chat",
      reconnectDelay: 5000,
      debug: (msg) => console.log("[WebSocket Debug]", msg),

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
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === "") {
        console.error("No valid input");
        return;
    }
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.error("WebSocket is not connected yet.");
      return;
    }

    if (!chatId || !user || !recipient) {
        console.error("Chat ID, sender, or recipient is missing.");
        return;
      }

    const message = {
      chatId,
      sender: user.id,
      recipient: recipient.id,
      content: input,
    };

    setMessages([...messages, message]);

    stompClientRef.current.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(message),
    });

    setInput("");
  };

  // ✅ No need for an early return here since the redirect is handled in useEffect

  return (
    <div>
      <h2>Chat Room - {chatId}</h2>
      <p>Chatting with {recipient?.name}</p>
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 p-4">
        <div className="flex-1 overflow-y-auto space-y-2 p-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-fit px-4 py-2 rounded-lg text-white break-words ${
                msg.sender === user?.id ? "bg-blue-500 self-end" : "bg-gray-600 self-start"
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
    </div>
  );
};

export default ChatScreen;