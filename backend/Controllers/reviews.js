const List = require("../Models/listing");
const Review = require("../Models/review");

module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  let listing = await List.findById(id);
  let reviews = new Review(req.body.review);
  reviews.author = req.user._id;
  listing.reviews.push(reviews._id);
  await reviews.save();
  await listing.save();
  req.flash("success", "Review added");
  res.redirect(`/listing/${id}`);
};
module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await List.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "review deleted");
  res.redirect(`/listing/${id}`);
};
