const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { ensureAuthenticated } = require("../config/auth");

// Get all posts
router.get("/", async (req, res) => {
  const perPage = 2;
  let page = Number(req.query.page) || 1;

  // Check to make sure the page number is never less than 1
  if (page < 1) page = 1;

  const posts = await Post.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate("author")
    .lean();

  // Add comment count to each post
  const postsWithCommentCount = posts.map((post) => ({
    ...post,
    commentCount: post.comments.length,
  }));

  const count = await Post.countDocuments();

  const pages = Math.ceil(count / perPage);

  // Generate an array of page numbers
  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  res.render("posts", {
    posts: postsWithCommentCount,
    current: page,
    totalPages: pages,  // total count of pages
    prevPage: page - 1, // previous page number
    nextPage: page + 1, // next page number
    hasNextPage: page < pages, // check if there's a next page
  });

  console.log(postsWithCommentCount);
});

// Get single post
router.get("/post/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author")
    .populate("comments.author") // populate comment authors
    .lean();
  res.render("post", { post });
});

// Create new post
router.get("/new", ensureAuthenticated, (req, res) => res.render("new"));

router.post("/new", ensureAuthenticated, async (req, res) => {
  console.log("Received POST request at /new");

  // req.body.post doesn't exist, extract title and description directly from req.body
  const { title, description } = req.body;
  console.log("Post title:", title);
  console.log("Post description:", description);

  const newPost = new Post({
    title,
    description,
    author: req.user._id,
  });

  await newPost.save();
  console.log("Saved new post:", newPost);

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
