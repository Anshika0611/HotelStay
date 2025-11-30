const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const List = require("./Models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync=require('./utils/wrapAsync')
const ExpressError=require('./utils/ExpressError')
const {listingSchema,reviewSchema}=require('./schema.js')
const Review=require('./Models/review.js')

app.use(methodOverride("_method"));
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body)
  if(error){
     let errMsg=error.details.map(el=>el.message).join(',');
    throw new ExpressError(400,errMsg)
  }else{
    next()
  }

}
const validateSchema=(req,res,next)=>{
  // console.log(req.body);
  const {error}=listingSchema.validate(req.body)
  // console.log(error);
  if(error){
    // we can print just the msg 
    let errMsg=error.details.map(el=>el.message).join(',');
    throw new ExpressError(400,errMsg)
  }else{
    next()
  }
}
app.get("/", (req, res) => {
  res.send("working");
});
// app.get('/test',(req,res)=>{
//     const list1=new List({
//         title:'default place',
//         description:'sunset',
//         image:{filename:'helloo',
//             url:"https//"
//         },
//         price:1000,
//         location:"lucnkow",
//         country:'india'
//     })
//     // list1.save().then(res=>{console.log(res);})
//     res.send("ok")
// })

// home page that has list of all places

app.get("/listing",wrapAsync(async (req, res) => {
  let list = await List.find({});
  res.render("./listings/index.ejs", { list });
}));
//creating new listing
app.get("/listing/new", (req, res) => {
  res.render("listings/new.ejs");
});
app.post("/listing",validateSchema, wrapAsync(async (req, res,next) => {
  // console.log(req.body.listing);
  // let{title,description,image,price,location,country}=req.body
  // console.log(title,description,image,price,location,country);
  // another way
  if(!req.body.listing){
    next(new ExpressError(400,"send correct data to the api"))
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
    await newListing.save();
    // console.log(newListing);
    res.redirect("/listing");
}));

//showing individual listing from the list
app.get("/listing/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let post = await List.findById(id).populate("reviews");
  // console.log(post);
  res.render("listings/show", { post });
}));
// edit the existing listing
app.get("/listing/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let list = await List.findById(id);
  res.render("listings/edit.ejs", { list });
}));
app.patch("/listing/:id",validateSchema, wrapAsync(async (req, res,next) => {
  let { id } = req.params;
  let listing = req.body.listing;
  if(!req.body.listing){
    next(new ExpressError(400,"send correct data to the api"))
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
  console.log("updated");
  res.redirect(`/listing/${id}`);
}));
//delete the listing
app.delete("/listing/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await List.findByIdAndDelete(id);
  res.redirect("/listing");
}));
// adding reviews
app.post('/listing/:id/review',validateReview, wrapAsync(async(req,res)=>{
  let {id}=req.params
  let reviews=new Review(req.body.review)
  // console.log(reviews);
  await reviews.save()
  let listing=await List.findById(id)
  listing.reviews.push(reviews._id)
  await listing.save()
  // console.log(listing);
  res.redirect(`/listing/${id}`)
}))
//deleting reviews
app.delete("/listing/:id/review/:reviewId",wrapAsync(async(req,res)=>{
  let {id,reviewId}=req.params
  await List.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
  res.redirect(`/listing/${id}`)
}))


// lets create a generic route for when none of the above path match
app.use((req,res,next)=>{
    next(new ExpressError(404,'Page Not Found'))
})


// //error handling
// app.use((err, req, res, next) => {
//   res.send("something went wrong");
// });

app.use((err,req,res,next)=>{
  let {status=501,message="something went wrong"}=err
  // res.status(status).send(message)
  res.status(status).render('error.ejs',{message})
})

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
