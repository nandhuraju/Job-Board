const { DataTypes } = require("sequelize");

const Application = (sequelize) => {
  return sequelize.define("Application", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Jobs", // Must match table name
        key: "id",
      },
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Ensure this refers to the Users table
        key: "id",
      },
    },
  });
};

module.exports = Application;
