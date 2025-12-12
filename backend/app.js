const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const listing = require("./Routes/listing.js");
const review=require('./Routes/review.js')

app.use(methodOverride("_method"));

const flash=require('connect-flash')
const session=require('express-session')

const sessionOption={
  secret:"mysecretkey",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+ 7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}
app.use(session(sessionOption))
app.use(flash())
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



app.get("/", (req, res) => {
  res.send("working");
});

//middleware for flash
app.use((req,res,next)=>{
  res.locals.success=req.flash("success")
  res.locals.error=req.flash("error")
  next()
})

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

app.use("/listing", listing); //go to routes to understand them
// adding reviews
app.use('/listing/:id/review',review)

// lets create a generic route for when none of the above path match
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//error handling
app.use((err, req, res, next) => {
  res.send("something went wrong");
});

app.use((err, req, res, next) => {
  let { status = 501, message = "something went wrong" } = err;
  // res.status(status).send(message)
  res.status(status).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
