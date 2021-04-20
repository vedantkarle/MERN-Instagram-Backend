const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const requireLogin = require("../middlewares/requireLogin");
const Post = require("../models/Post");

router.post(
  "/posts/new",
  requireLogin,
  asyncHandler(async (req, res) => {
    const { title, body, image } = req.body;

    if (!title || !body) {
      res.status(422);
      throw new Error("Please add all fields");
    }

    const post = await Post.create({
      title,
      body,
      photo: image,
      postedBy: req.user._id,
    });

    res.status(201).json(post);
  })
);

router.get(
  "/posts",
  requireLogin,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({}).populate("postedBy", "_id name");

    res.status(200).json(posts);
  })
);

router.get(
  "/posts/my",
  requireLogin,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "_id name"
    );

    res.status(200).json(posts);
  })
);

router.post(
  "/like/:postId",
  requireLogin,
  asyncHandler(async (req, res) => {
    try {
      const existingPost = await Post.findOne({ _id: req.params.postId });

      const isLiked =
        existingPost.likes && existingPost.likes.includes(req.user._id);

      const option = isLiked ? "$pull" : "$push";

      const post = await Post.findByIdAndUpdate(
        req.params.postId,
        {
          [option]: { likes: req.user._id },
        },
        { new: true }
      );
      res.json(post);
    } catch (error) {
      res.status(500);
      throw new Error(error.message);
    }
  })
);

router.post(
  "/comment/:postId",
  requireLogin,
  asyncHandler(async (req, res) => {
    try {
      const comment = { text: req.body.text, postedBy: req.user._id };

      const post = await Post.findByIdAndUpdate(
        req.params.postId,
        {
          $push: { comments: comment },
        },
        { new: true }
      ).populate("comments.postedBy", "_id name");
      res.json(post);
    } catch (error) {
      res.status(500);
      throw new Error(error.message);
    }
  })
);

module.exports = router;
