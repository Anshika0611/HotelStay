const User = require("../Models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("./authentication/signup.ejs");
};
module.exports.signup = async (req, res, next) => {
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
};
module.exports.renderLoginForm=(req, res) => {
  res.render("./authentication/login.ejs");
}
module.exports.login= (async (req, res) => {
    req.flash("success", "Welcome back to WanderLust");
    let redirect = res.locals.redirectUrl || "/listing";
    res.redirect(redirect);
  })
  module.exports.logOut=(req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "Yor are logged out");
      res.redirect("/listing");
    }
  });
}
