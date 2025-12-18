const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const List = require("../Models/listing");
const Review = require("../Models/review.js");
const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await List.findById(id);
    let reviews = new Review(req.body.review);
    reviews.author = req.user._id;
    listing.reviews.push(reviews._id);
    await reviews.save();
    await listing.save();
    req.flash("success", "Review added");
    res.redirect(`/listing/${id}`);
  })
);
//deleting reviews
router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  async (req, res) => {
    let { id, reviewId } = req.params;
    await List.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "review deleted");
    res.redirect(`/listing/${id}`);
  }
);

module.exports = router;
