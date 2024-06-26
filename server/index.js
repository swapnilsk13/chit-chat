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

// Middleware
app.use(cors()); // Use CORS middleware globally

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

// Assign socket object to every request
app.use(function (req, res, next) {
  req.io = socketIo;
  next();
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route handlers
app.get("/", (req, res) => {
  res.send("Hello from Chit Chat Server!"); // Example response
});

app.use("/users", users);
app.use("/messages", messages);
