const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const dotenv = require("dotenv");
dotenv.config();
const checkAuthUser = async (req, res, next) => {
  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);

      req.body.user = await User.findById(userId).select("-password");
      req.body.userId = userId;
      next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ message: "Unauthorised user", success: false });
    }
  }
  if (!token) {
    res
      .status(401)
      .json({ message: "Unauthorised user no token", success: false });
  }
};
module.exports = checkAuthUser;
