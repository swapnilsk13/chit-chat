const express = require("express");

// Create an instance of the Express Router
const routes = express.Router();
const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Dummy API for testing
routes.get("/dummyApi", (req, res) => {
  // Respond with a simple message
  res.send("dummy Api is working");
});

// User login API
routes.post("/login", async (req, res) => {
  // Validate user request body (username and password)
  console.log(req.body);
  if (!req.body.userName || !req.body.password) {
    // Return an error response if username or password is missing
    res
      .status(400)
      .send("username and password are required and cannot be empty");
  } else {
    // Validate from MongoDB
    let user = await UserModel.findOne({ userName: req.body.userName });
    if (!user) {
      return res.status(400).json("Invalid username");
    }

    let isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).json("Invalid Password");
    }

    const payload = {
      id: user._id,
      userName: req.body.name,
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 31556926,
    });
    console.log(token);
    res.json({
      success: true,
      name: user.name,
      userName: user.userName,
      id: user._id,
      token: token,
    });
  }
});

// Signup API
routes.post("/signup", async (req, res) => {
  console.log(req.body);

  if (!req.body.name || !req.body.userName || !req.body.password) {
    // Return an error response if name, username, or password is missing
    res.status(400).send("name, username, and password are required");
  } else {
    // Check if the user already exists
    let user = await UserModel.findOne({ userName: req.body.userName });
    if (user) {
      // Return an error response if the username already exists
      return res.status(400).json("username already exists");
    }

    // Bcrypt: Generate salt and hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    const hash = await bcrypt.hash(req.body.password, salt);

    // Create a new user instance with hashed password
    const newUser = new UserModel({
      name: req.body.name,
      userName: req.body.userName,
      password: hash,
    });

    req.io.sockets.emit("users", req.body.userName);
    // Save the new user to the database
    newUser
      .save()
      .then((user) => {
        console.log(user);

        // JWT Token: Generate a token for the user
        const payload = {
          id: user._id,
          userName: user.name,
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 31556926 },
          (err, token) => {
            // Respond with a JSON containing user details and the generated token
            res.json({
              success: true,
              name: user.name,
              userName: user.userName,
              id: user._id,
              token: token,
            });
          }
        );
      })
      .catch((err) => {
        // Handle any errors that occur during user creation
        res.send(err);
      });
  }
});

//get users api
routes.get("/", async (req, res) => {
  let token = req.headers.auth;
  //check if token is present
  if (!token) {
    return res.status(400).json("unauthorized no token");
  }
  console.log(token);
  //validating token
  let jwtUser;
  try {
    jwtUser = await jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    return res.status(400).json("Invalid token");
  }
  console.log({ jwtUser });
  if (!jwtUser) {
    return res.status(400).json("unauthorized");
  }
  //find all users and send
  let users = await UserModel.aggregate().project({
    password: 0,
    date: 0,
    __v: 0,
  });
  res.send(users);
});

// Export the routes for use in other modules
module.exports = routes;
