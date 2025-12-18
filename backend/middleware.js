const List = require("./Models/listing");
const Review = require("./Models/review.js");
const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    //if user is not loggedin only then we have to save the redirecturl
    if (req.method === "GET") {
    req.session.redirectUrl = req.originalUrl;
  }
  if (req.method === "DELETE" && req.params.id) {
  req.session.redirectUrl = `/listing/${req.params.id}`;
}
    req.flash("error", "You have to be logged in to do that");
    res.redirect("/login");
  }
};
module.exports.saveRedirectUrl = (req, res, next) => {
  // console.log(res.locals.redirectUrl);
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
module.exports.validateListing= (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    // we can print just the msg
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing=await List.findById(id)
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of the listing");
    return res.redirect(`/listing/${id}`);
  }
  next()
};

module.exports.isAuthor=async(req,res,next)=>{
    const {id,reviewId} =req.params
    const review=await Review.findById(reviewId)
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error","You did not created this review")
      return res.redirect(`/listing/${id}`)
    }
    next()
}

