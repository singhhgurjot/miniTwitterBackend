const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  bio: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet", default: [] }],
  likedTweets: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Tweet", default: [] },
  ],
});
const User = mongoose.model("User", userSchema);
module.exports = User;
