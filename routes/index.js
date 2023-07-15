const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { ensureAuthenticated } = require("../config/auth");

// Get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find({}).populate("author").lean();
  res.render("posts", { posts });
});

// Get single post
router.get("/post/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author").lean();
  res.render("post", { post });
});

// Create new post
router.get("/new", ensureAuthenticated, (req, res) => res.render("new"));

router.post("/new", ensureAuthenticated, async (req, res) => {
  // req.body.post doesn't exist, extract title and description directly from req.body
  const { title, description } = req.body;

  const newPost = new Post({
    title,
    description,
    author: req.user._id,
  });

  await newPost.save();
  res.redirect("/");
});

// Edit post
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author")
    .lean()
    .exec();
  console.log("Route User: ", req.user); // Add this line
  if (req.user._id.toString() === post.author._id.toString()) {
    res.render("edit", { post });
  } else {
    res.redirect("/");
  }
});
router.put("/post/:id", ensureAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author");
  if (req.user._id.toString() === post.author._id.toString()) {
    post.title = req.body.post.title;
    post.description = req.body.post.description;
    await post.save();
    res.redirect(`/post/${post._id}`);
  } else {
    res.redirect("/");
  }
});

// Delete post
router.delete("/post/:id", ensureAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    console.log("Post not found");
    return res.status(404).send("Post not found");
  }
  if (post.author._id.toString() !== req.user._id.toString()) {
    return res.status(403).send("Not authorized");
  }
  if (post.comments.length > 0) {
    return res.status(403).send("Cannot delete post with comments");
  }
  await Post.deleteOne({ _id: req.params.id }); // Use Post.deleteOne() here
  res.redirect("/");
});

module.exports = router;
