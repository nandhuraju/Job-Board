require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { sequelize, Chat } = require("./models");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", // Use environment variables for production
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/chat", chatRoutes);

// Store online users: Map<userId, Set<socketId>>
const users = new Map();

// Utility function to emit updated online users
const emitOnlineUsers = () => {
  const onlineUserIds = Array.from(users.keys());
  io.emit("updateOnlineUsers", onlineUserIds);
};

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`🔗 New connection: ${socket.id}`);

  // Register user (Associate socket with userId)
  socket.on("register", (userId) => {
    if (!userId) return;
    if (!users.has(userId)) users.set(userId, new Set());
    users.get(userId).add(socket.id);

    console.log(`✅ User ${userId} registered with socket ${socket.id}`);

    // Notify clients about updated online users
    emitOnlineUsers();
  });

  // Handle message sending and broadcasting
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    if (!senderId || !receiverId || !message) {
      console.warn("⚠️ Invalid message payload");
      return;
    }

    try {
      console.log(`💬 Message from ${senderId} to ${receiverId}: ${message}`);

      // Save message to database
      const savedMessage = await Chat.create({ senderId, receiverId, message });

      // Send message to the receiver if online
      if (users.has(receiverId)) {
        users.get(receiverId).forEach((receiverSocketId) => {
          io.to(receiverSocketId).emit("receiveMessage", savedMessage);
        });
      }

      // Send confirmation to sender
      if (users.has(senderId)) {
        users.get(senderId).forEach((senderSocketId) => {
          io.to(senderSocketId).emit("messageSent", savedMessage);
        });
      }
    } catch (error) {
      console.error("❌ Error saving message:", error);
      socket.emit("error", { message: "Failed to send message." });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    // Remove socket from users map
    users.forEach((sockets, userId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) users.delete(userId); // Remove user if no active sockets
      }
    });

    // Notify clients about updated online users
    emitOnlineUsers();
  });
});

// Sync database and start server
sequelize
  .sync({ alter: true }) // Sync models with database
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ Database sync error:", err));
