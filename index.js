const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./router/userRoutes.ts");
dotenv.config();
const app = express();
app.use(express.json());
app.listen(process.env.PORT, () => {
  {
    console.log(`Listening to PORT ${process.env.PORT}`);
  }
});
mongoose.connect(process.env.MONGO_URL).then((db) => {
  console.log("Connected To DB Successfully");
});
app.use("/api/users", userRoute);
