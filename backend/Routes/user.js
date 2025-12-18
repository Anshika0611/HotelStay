const express = require("express");
const User = require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const app = express();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

//user signup
router.get("/signup", (req, res) => {
  res.render("./authentication/signup.ejs");
});
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      let { email, username, password } = req.body;
      let newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Wanderlust");
        res.redirect("/listing");
      });
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
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back to WanderLust");
    let redirect = res.locals.redirectUrl || "/listing";
    res.redirect(redirect);
  })
);

//logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "Yor are logged out");
      res.redirect("/listing");
    }
  });
});

module.exports = router;
