const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const List = require("../Models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let list = await List.find({});
    res.render("./listings/index.ejs", { list });
  })
);

//creating new listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // console.log(req.body.listing);
    // let{title,description,image,price,location,country}=req.body
    // console.log(title,description,image,price,location,country);
    // another way
    if (!req.body.listing) {
      next(new ExpressError(400, "send correct data to the api"));
    }
    let listing = req.body.listing;
    //we can write if condition for each field
    // if(!listing.title){
    //   next(new ExpressError(400,'mention title'))
    // }
    // if(!listing.description){
    //   next(new ExpressError(400,'mention description'))
    // } ... and soon
    // or we can use a tool for schema validation called Joi
    // const result=listingSchema.validate(req.body)
    // // console.log(result);
    // if(result.error){
    //   throw new ExpressError(400,result.error)
    // }
    // can create a diff funct. for above joi code
    if (!listing.image || listing.image.trim() === "") {
      listing.image = undefined; // allow schema default to apply
    } else {
      listing.image = {
        filename: "listingimage",
        url: listing.image,
      };
    }
    const newListing = new List(listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "new listing created");
    // console.log(newListing);
    res.redirect("/listing");
  })
);

//showing individual listing from the list
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let post = await List.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } }) //to get the author for each review we do nested populate
      .populate("owner");
    // console.log(post);
    if (!post) {
      req.flash("error", "Listing you are requesting for does not exist");
      return res.redirect("/listing");
    }
    res.render("listings/show", { post });
  })
);

// edit the existing listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let list = await List.findById(id);
    if (!list) {
      req.flash("error", "Listing you are requesting for does not exist");
      return res.redirect("/listing");
    }
    res.render("listings/edit.ejs", { list });
  })
);
router.patch(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = req.body.listing;
    if (!req.body.listing) {
      next(new ExpressError(400, "send correct data to the api"));
    }
    // console.log(...req.body.listing);
    if (listing.image && listing.image.trim() !== "") {
      listing.image = {
        filename: "listingimage",
        url: listing.image,
      };
    } else {
      // If empty → keep existing image (don’t overwrite)
      delete listing.image;
    }
    await List.findByIdAndUpdate(id, listing);
    req.flash("success", " listing updated");
    // console.log("updated");
    res.redirect(`/listing/${id}`);
  })
);

//delete the listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await List.findByIdAndDelete(id);
    req.flash("success", "Listing has been deleted");
    res.redirect("/listing");
  })
);

module.exports = router;
