const express = require("express");
const User = require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const app = express();
const passport = require("passport");

//user signup
router.get("/signup", (req, res) => {
  res.render("./authentication/signup.ejs");
});
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { email, username, password } = req.body;
      let newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.flash("success", "User was registered");
      res.redirect("/listing");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

//user login
router.get("/login", (req, res) => {
  res.render("./authentication/login.ejs");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    req.flash('success','Welcome back to WanderLust')
    res.redirect("/listing");
  })
);

module.exports = router;
