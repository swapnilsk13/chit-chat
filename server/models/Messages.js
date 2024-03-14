const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessagesSchema = new Schema({
    conersation: {
        type: Schema.Types.ObjectId,
        ref: "conversations",
    },  
  from: {
    require: true,
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  to: {
    require: true,
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  body: {
    type: String,
  },
  date: {
    type: String,
    default: Date.now(),
  },
});

const Messages = mongoose.model("messages", MessagesSchema);
module.exports = Messages;
