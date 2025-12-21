const List = require("../Models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

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
  let coordinate= await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1 // this sets the limit on how many responses do we want 
})
  .send();
  const location=coordinate.body.features[0].geometry
  // console.log(coordinate.body.features[0].geometry);
  // return res.send("done")
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
  newListing.geography=location
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
  //not doing the preview bc it is working only for the cloudinary urls not the past listings
  // we will edit the things in img here for the img preview
  // let original_Img=list.image.url
  // original_Img=original_Img.replace('/upload','/upload/w_250,h_200')
  // res.render("listings/edit.ejs", { list,original_Img});
  res.render("listings/edit.ejs", { list});

};
module.exports.updatedListing = async (req, res, next) => {
  let { id } = req.params;
  if (!req.body.listing) {
    next(new ExpressError(400, "send correct data to the api"));
  }
  const listing = await List.findByIdAndUpdate(id, req.body.listing); //we first let other than img file update bc they are coming from req.body rather than req.file after this img gets updated in the db
    if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", " listing updated");
  res.redirect(`/listing/${id}`);
};
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await List.findByIdAndDelete(id);
  req.flash("success", "Listing has been deleted");
  res.redirect("/listing");
};
