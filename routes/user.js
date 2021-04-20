const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const asyncHandler = require("express-async-handler");
const requireLogin = require("../middlewares/requireLogin");

router.get(
  "/profile/:id",
  requireLogin,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id }).select(
        "-password"
      );

      const posts = await Post.find({ postedBy: user._id }).populate(
        "postedBy",
        "_id name"
      );

      res.json({ user, posts });
    } catch (error) {
      res.status(404);
      throw new Error(error.message);
    }
  })
);

router.post(
  "/follow/:id",
  requireLogin,
  asyncHandler(async (req, res) => {
    try {
      User.findByIdAndUpdate(
        req.params.id,
        {
          $push: { followers: req.user._id },
        },
        { new: true },
        async (err, result) => {
          if (err) {
            res.status(422);
            throw new Error(error.message);
          }

          await User.findByIdAndUpdate(
            req.user._id,
            {
              $push: { following: req.params.id },
            },
            { new: true }
          );
          res.json(result);
        }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  })
);

router.post(
  "/unfollow/:id",
  requireLogin,
  asyncHandler(async (req, res) => {
    try {
      User.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { followers: req.user._id },
        },
        { new: true },
        async (err, result) => {
          if (err) {
            res.status(422);
            throw new Error(error.message);
          }

          await User.findByIdAndUpdate(
            req.user._id,
            {
              $pull: { following: req.params.id },
            },
            { new: true }
          );
          res.json(result);
        }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  })
);

router.put(
  "/updatePhoto/:id",
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id, {
        photo: req.body.image,
      });
      res.json(user);
    } catch (error) {
      throw new Error(error.message);
    }
  })
);

module.exports = router;
