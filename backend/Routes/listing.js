const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../Controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
// const upload=multer({dest:'uploads/'})   dest tells where all the uploaded data will be saved and this folder is created automatically
const upload = multer({ storage }); // now the data will be saved in storage on cloudinary

// index route and create route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

//creating new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);
//show, edit listing, delete listing routes
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .patch(
    isLoggedIn,
    isOwner,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.updatedListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// edit the existing listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
