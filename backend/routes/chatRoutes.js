const express = require("express");
const { Chat, User, Sequelize } = require("../models");
const router = express.Router();
const { Op } = Sequelize;

// ✅ Send a chat message
router.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // Validate required fields
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const sender = parseInt(senderId);
    const receiver = parseInt(receiverId);

    // Validate user IDs
    if (isNaN(sender) || isNaN(receiver)) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    // Prevent self-chat
    if (sender === receiver) {
      return res
        .status(400)
        .json({ error: "Cannot send messages to yourself" });
    }

    // Ensure both users exist
    const [senderUser, receiverUser] = await Promise.all([
      User.findByPk(sender),
      User.findByPk(receiver),
    ]);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    // Save message to the database
    const chat = await Chat.create({
      senderId: sender,
      receiverId: receiver,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chat,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get chat history between two users
router.get("/history/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const limit = parseInt(req.query.limit) || 50; // Default: 50 messages
    const page = parseInt(req.query.page) || 1; // Default: page 1

    const user1 = parseInt(userId);
    const user2 = parseInt(otherUserId);

    // Validate input
    if (isNaN(user1) || isNaN(user2)) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    // Prevent self-chat history
    if (user1 === user2) {
      return res
        .status(400)
        .json({ error: "Cannot fetch chat history with yourself" });
    }

    // Ensure both users exist
    const [userA, userB] = await Promise.all([
      User.findByPk(user1),
      User.findByPk(user2),
    ]);
    if (!userA || !userB) {
      return res.status(404).json({ error: "User(s) not found" });
    }

    // Fetch chat history with pagination
    const offset = (page - 1) * limit;
    const chatHistory = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, as: "Sender", attributes: ["id", "name"] },
        { model: User, as: "Receiver", attributes: ["id", "name"] },
      ],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      chatHistory,
      pagination: {
        page,
        limit,
        totalMessages: chatHistory.length,
      },
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
