// 3rd party packages
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

// Core modules
const bodyParser = require("body-parser");

// Own modules
const users = require("./routes/users");
const messages = require("./routes/messages");

const app = express();
const port = process.env.PORT || 8080; // Corrected from process.env.port
const mongodbURI = process.env.MONGOOSE_URI;

// Server setup
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Socket.io setup
const socketIo = require("socket.io")(server, { cors: { origin: "*" } });

// Database Configuration
mongoose
  .connect(mongodbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

// Middleware
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://chit-chat-client-mu.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Assign socket object to every request
app.use(function (req, res, next) {
  req.io = socketIo;
  next();
});

// Route handlers
app.get("/", (req, res) => {
  res.send("Hello from Chit Chat Server!"); // Example response
});

app.use("/users", users);
app.use("/messages", messages);
