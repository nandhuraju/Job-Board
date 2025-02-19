const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is a company
const isCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  if (req.user.role !== "company") {
    return res.status(403).json({
      message: "Access denied. Only companies can perform this action.",
    });
  }
  next();
};

// Middleware to check if user is an applicant
const isApplicant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  if (req.user.role !== "applicant") {
    return res.status(403).json({
      message: "Access denied. Only applicants can perform this action.",
    });
  }
  next();
};

module.exports = { authenticateUser, isCompany, isApplicant };
