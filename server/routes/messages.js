const express = require("express");
const GlobalMessage = require("../models/GlobalMessage");
const Messages = require("../models/Messages");
const Conversation = require("../models/Conversation");
const jwt = require("jsonwebtoken");
const routes = express.Router();
const mongoose = require("mongoose");

let jwtUser;

routes.use(async (req, res, next) => {
  let token = req.headers.auth;

  //checking if have token
  if (!token) {
    return res.status(404).json("Unauthorized token is not");
  }

  //validate token
  //bearer djkjfskjfks f d dfd d
  // split [djkjfskjfks f d dfd d]
  //1
  jwtUser = await jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
  if (!jwtUser) {
    return res.status(400).res("Unauthorized");
  } else next();
  console.log("jwt user", jwtUser.id);
});

//send global message
routes.post("/global", async (req, res) => {
  let message = new GlobalMessage({
    from: jwtUser.id,
    body: req.body.message,
  });
  req.io.sockets.emit("messages",req.body.message);
  let respone = await message.save();
  res.send(respone);
});

routes.get("/globalMessages", async (req, res) => {
  // let messages = await GlobalMessage.find();
  // res.send(messages);

  let messages = await GlobalMessage.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "from",
        foreignField: "_id",
        as: "userObj",
      },
    },
  ]).project({
    "userObj.password": 0,
    "userObj.date": 0,
    "userObj.__v": 0,
    __v: 0,
  });
  res.send(messages);
});

//send personal message
routes.post("/personal", async (req, res) => {
  let from = new mongoose.Types.ObjectId(jwtUser.id); // logged in person
  let to = new mongoose.Types.ObjectId(req.body.sender); //person whom we want to send a message

  let conversation = await Conversation.findOneAndUpdate(
    {
      reciepents: {
        $all: [{ $elemMatch: { $eq: from } }, { $elemMatch: { $eq: to } }],
      },
    },
    {
      reciepents: [from, to],
      lastMessage: req.body.message,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
  let message = new Messages({
    conversation: conversation._id,
    from: from,
    to: to,
    body: req.body.message,
  });
  req.io.sockets.emit("messages", req.body.message);
  let messageData = await message.save();
  res.send(messageData);
});

//conversation list
//between from and everyone
routes.get("/conversationList", async (req, res) => {
  let from = new mongoose.Types.ObjectId(jwtUser.id); //logged in person

  let conversationList = await Conversation.aggregate([
    {
      $lookup: {
        from: "users", //which collection need to look or check
        localField: "reciepents", //what is the key in your collection
        foreignField: "_id", //what is the key in lookup collection
        as: "recipentObj", //details are stored in recipentObj variable
      },
    },
  ])
    .match({
      reciepents: {
        $all: [{ $elemMatch: { $eq: from } }],
      },
    })
    .project({
      "recipentObj.password": 0,
      'recipentObj.__v':0,
      'recipentObj.date':0
    })
    .exec();
  res.send(conversationList);
});

//conversation list
//between from and everyone
routes.get("/conversationByUser/query", async (req, res) => {
  let from = new mongoose.Types.ObjectId(jwtUser.id); //logged in person
  let to = new mongoose.Types.ObjectId(req.query.userId);

  let messagesList = await Messages.aggregate([
    {
      $lookup: {
        from: "users", //which collection need to look or check
        localField: "from", //what is the key in your collection
        foreignField: "_id", //what is the key in lookup collection
        as: "fromObj", //details are stored in recipentObj variable
      },
      $lookup: {
        from: "users", //which collection need to look or check
        localField: "to", //what is the key in your collection
        foreignField: "_id", //what is the key in lookup collection
        as: "toObj", //details are stored in recipentObj variable
      },
    },
  ])
    .match({
      $or: [
        { $and: [{ to: to }, { from: from }] },
        { $and: [{ to: from }, { from: to }] },
      ]
    })
    .project({
      "fromObj.password": 0,
      "fromObj.__v": 0,
      "fromObj.date": 0,
      "toObj.password": 0,
      "toObj.__v": 0,
      "toObj.date": 0,
    })
    .exec();
  res.send(messagesList);
});

module.exports = routes;
