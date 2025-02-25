"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Read all model files dynamically and import them
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Define Associations
const { Job, Application, User, Chat } = db;

// Job and Application Relationship
Application.belongsTo(Job, { foreignKey: "jobId" });
Job.hasMany(Application, { foreignKey: "jobId" });

// User and Application Relationship
Application.belongsTo(User, { foreignKey: "applicantId" });
User.hasMany(Application, { foreignKey: "applicantId" });

// User and Chat Relationship (for messaging)
Chat.belongsTo(User, { as: "Sender", foreignKey: "senderId" });
Chat.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" });
User.hasMany(Chat, { foreignKey: "senderId" });
User.hasMany(Chat, { foreignKey: "receiverId" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
