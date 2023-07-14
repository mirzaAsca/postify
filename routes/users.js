const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
// Register
router.get("/register", (req, res) => res.render("register"));
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password });
  newUser.password = newUser.generateHash(password);
  await newUser.save();
  req.flash("success_msg", "You are now registered and can log in");
  res.redirect("/users/login");
});

// Login
router.get("/login", (req, res) => res.render("login"));
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;
