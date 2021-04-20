const express = require("express");
const router = express.Router();
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middlewares/requireLogin");

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, photo } = req.body;

    if (!name || !email || !password) {
      res.status(422);
      throw new Error("Please add all fields");
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(422);
      throw new Error("User alreay exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      photo,
    });

    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET);

    res.json({
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        photo: newUser.photo,
      },
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    let user;

    if (!email || !password) {
      res.status(422);
      throw new Error("Please add all fields");
    }

    user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("Invalid Credentials!");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(422);
      throw new Error("Invalid Credentials!");
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    res.json({
      token,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  })
);

router.get("/protected", requireLogin, (req, res) => {
  res.send("Hello");
});

module.exports = router;
