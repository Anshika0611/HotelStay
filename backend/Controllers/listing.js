const List = require("../Models/listing");

module.exports.index = async (req, res) => {
  let list = await List.find({});
  res.render("./listings/index.ejs", { list });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
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
};
module.exports.createListing = async (req, res, next) => {
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

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new List(listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url }; // this will add image into backend
  await newListing.save();
  req.flash("success", "new listing created");
  res.redirect("/listing");
};
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let list = await List.findById(id);
  if (!list) {
    req.flash("error", "Listing you are requesting for does not exist");
    return res.redirect("/listing");
  }
  res.render("listings/edit.ejs", { list });
};
module.exports.updatedListing = async (req, res, next) => {
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
};
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await List.findByIdAndDelete(id);
  req.flash("success", "Listing has been deleted");
  res.redirect("/listing");
};
