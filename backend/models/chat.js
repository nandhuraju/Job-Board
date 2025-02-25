const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Chat = sequelize.define(
    "Chat",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false, // Disable `updatedAt` since you're manually handling `createdAt`
    }
  );

  // ✅ Define associations
  Chat.associate = (models) => {
    Chat.belongsTo(models.User, { as: "Sender", foreignKey: "senderId" });
    Chat.belongsTo(models.User, { as: "Receiver", foreignKey: "receiverId" });
  };

  return Chat;
};
