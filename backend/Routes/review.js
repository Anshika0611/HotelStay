const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const List = require("../Models/listing");
const Review = require("../Models/review.js");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);
    console.log(req.body.review);
    let reviews = new Review(req.body.review);
    console.log(reviews);
    await reviews.save();
    let listing = await List.findById(id);
    console.log(listing);
    listing.reviews.push(reviews._id);
    await listing.save();
    req.flash("success", "Review added");

    // console.log(listing);
    res.redirect(`/listing/${id}`);
  })
);
//deleting reviews
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await List.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "review deleted");
    res.redirect(`/listing/${id}`);
  })
);

module.exports = router;
