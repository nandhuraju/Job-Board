import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const ChatApp = () => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const chatEndRef = useRef(null);

  // Get logged-in user details
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      setCurrentUser(user);
      socket.emit("register", user.id); // Register user on the socket
      fetchUsers();
    }
  }, []);

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/all");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  // Listen for online users update
  useEffect(() => {
    socket.on("updateOnlineUsers", (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });
    return () => socket.off("updateOnlineUsers");
  }, []);

  // Handle user selection for chat
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    fetchChatHistory(user.id);
  };

  // Fetch chat history
  const fetchChatHistory = async (receiverId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/history/${currentUser.id}/${receiverId}`
      );
      setChatHistory(response.data.chatHistory);
    } catch (err) {
      console.error("Error fetching chat history", err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (message.trim() && selectedUser) {
      const chatMessage = {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        message,
      };
      socket.emit("sendMessage", chatMessage);
      setChatHistory((prev) => [...prev, chatMessage]);
      setMessage("");
    }
  };

  // Receive message
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      if (
        (data.senderId === currentUser?.id &&
          data.receiverId === selectedUser?.id) ||
        (data.senderId === selectedUser?.id &&
          data.receiverId === currentUser?.id)
      ) {
        setChatHistory((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [currentUser, selectedUser]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="flex h-screen">
      {/* Sidebar: User List */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
        <h2 className="text-xl font-semibold mb-4">
          Welcome, {currentUser?.name}
        </h2>
        <h3 className="text-lg font-medium mb-2">Available Users:</h3>
        {users.map(
          (user) =>
            user.id !== currentUser?.id && (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`block w-full text-left p-2 mb-2 rounded-lg ${
                  selectedUser?.id === user.id
                    ? "bg-purple-200"
                    : "hover:bg-purple-100"
                }`}
              >
                {user.name}{" "}
                {onlineUsers.includes(user.id) && (
                  <span className="text-green-500 ml-2">(Online)</span>
                )}
              </button>
            )
        )}
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white shadow-md">
              <h3 className="text-xl font-semibold">
                Chat with {selectedUser.name}
              </h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`max-w-lg p-2 rounded-lg ${
                    chat.senderId === currentUser?.id
                      ? "bg-purple-500 text-white self-end"
                      : "bg-gray-200"
                  }`}
                >
                  {chat.message}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 p-2 border rounded-lg focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <h3 className="text-xl">Select a user to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
