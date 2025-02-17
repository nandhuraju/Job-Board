require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);

// Sync database and start server
sequelize
  .sync({ alter: true }) // Ensures the models match DB structure
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("Database sync error:", err));
