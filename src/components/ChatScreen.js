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
  const { chatSessionId, user, recipient } = chatData;

  // Function to check if page was reloaded
  const isPageReloaded = () => {
    const entries = window.performance.getEntriesByType("navigation");
    return entries.length > 0 && entries[0].type === "reload";
  };

  // 🔹 Redirect if chatSessionId, user, or recipient is missing
  useEffect(() => {
    if (!chatSessionId || !user?.userId || !recipient?.userId) {
      console.warn("Chat Session ID, user, or recipient missing! Redirecting...");
      navigate("/");  // ✅ Now handled inside useEffect
    } else {
        // Save to localStorage
        localStorage.setItem("chatData", JSON.stringify(chatData));
      }
  }, [chatSessionId, user, recipient, navigate, chatData]);

  useEffect(() => {
    if (chatSessionId && isPageReloaded()) {
        console.log("Fetching past messages for chat:", chatSessionId);

        fetch(`http://localhost:8080/chat/messages/${chatSessionId}`)
            .then(response => response.json())
            .then(data => {
                console.log("📜 Loaded previous messages:", data);
                setMessages(data) // ✅ Set messages state with fetched data
            })
            .catch(error => console.error("❌ Error fetching messages:", error));
    }
  }, [chatSessionId]);

  // Initialize WebSocket connection only if chatId, user, and recipient exist
  useEffect(() => {
    if (!chatSessionId) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws-chat",
      reconnectDelay: 5000,
      debug: (msg) => console.log("[WebSocket Debug]", msg),

      onConnect: () => {
        console.log("✅ Connected to WebSocket");

        // if (chatSessionId && user && user.userId) {
        //   const addUserMessage = {
        //     chatSessionId: chatSessionId,
        //     senderId: user.userId,
        //     type: 'JOIN' // You can add a type to distinguish join messages if needed
        //   };
        //   console.log("⬆️ Sending addUser message:", addUserMessage); // Log addUser message being sent
        //   client.publish({
        //     destination: "/app/chat.addUser",
        //     body: JSON.stringify(addUserMessage),
        //   });
        // } else {
        //   console.warn("addUser message not sent: chatSessionId or user info missing.");
        // }

        // 📝 ADD THESE LOGS BEFORE SUBSCRIBE
        console.log("🔌 WebSocket Connected Status before subscribe:", stompClientRef.current.connected);
        console.log("Subscribing to topic:", `/user/${user.userId}/queue/chat.${chatSessionId}`);

        client.subscribe(`/user/${user.userId}/queue/chat.${chatSessionId}`, (message) => {
          console.log("📩 Received Message:", message);
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        // 📝 ADD THIS LOG AFTER SUBSCRIBE (immediate log - subscription is asynchronous)
        console.log("Subscribed to topic:", `/user/${user.userId}/queue/chat.${chatSessionId}`);
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
  }, [chatSessionId, user]);

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

    if (!chatSessionId || !user || !recipient) {
        console.error("Chat ID, sender, or recipient is missing.");
        return;
      }
    

    const message = {
        chatSessionId,
        senderId: user.userId,
        recipientId: recipient.userId,
        content: input,
    };

    setMessages([...messages, message]);

        // 📝 ADD THESE LOGS RIGHT BEFORE PUBLISH
    console.log("sendMessage() called - about to publish message:", message);
    console.log("stompClientRef.current.connected:", stompClientRef.current.connected);

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
    });

    setInput("");
  };

  // ✅ No need for an early return here since the redirect is handled in useEffect

  return (
    <div>
      <h2>Chat Room - {chatSessionId}</h2>
      <p>Chatting with {recipient?.name}</p>
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 p-4">
        <div className="flex-1 overflow-y-auto space-y-2 p-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-fit px-4 py-2 rounded-lg text-white break-words ${
                msg.senderId === user?.userId ? "bg-blue-500 self-end" : "bg-gray-600 self-start"
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