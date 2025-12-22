if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");

app.use(methodOverride("_method"));

const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // .default is used bc in v6 of mongoStore implecitely it uses ES6 module to import and export and since we are requiring it, this shows  err without default
const User = require("./Models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});
store.on("err", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize()); // middleware that intializes passport
app.use(passport.session()); //this is used so that every req knows the session they are in and user does not have to login with tab switches
passport.use(new LocalStrategy(User.authenticate())); // this means user will be authenticated using localstrategy which is already written in passport
passport.serializeUser(User.serializeUser()); //user se related jitni info h usse session me store krna
passport.deserializeUser(User.deserializeUser());

mongoose.set("strictQuery", true); // since we reduced the version of mongodb so to ignore warnings this is written

const MONGO_URL =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";
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

// app.get("/", (req, res) => {
//   res.send("working");
// });

//middleware for flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
// creating a demo user
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "test123@gmail.com",
    username: "John Doe",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});
// The output for the above user is
// {
//   "email": "test123@gmail.com",
//   "_id": "693dbfdca09a8ce248a38d74",
//   "username": "John Doe",
//   "salt": "c93b4365861e4c3a3f17ac44f5cc5e73183dc6c925e8511fc84c6a21dbda50e4",
//   "hash": "1be1d62680313ec9f3e776a9ab1e69f24866cc04c71b62f03091435b16a8cfbc72ab4591787d7bde26441e3e319d2b7ddb0f7fbd38a38e0aa1e8feea7a1c5f2f61a0c66de5e6fbaa009e1dcea52e30b216922069640e73ab135413d768f989c389e9d8b87ddd7f3c95cee1561584cf684170e574175a3718ab8a8fc8211073bc20045afefbf8b52d58291936fb5097811a5b5cda155927c66f159ef712484989a5ef4da4f7e0de8c71ea1b4f0a9fd3b882dc87a922ee5ba78ef0c0cfba23944f7d742b7db42ed62b000ce7fa0c69d5ead35d2a3a1a4264d7570c14dda7185b0ca13f71251970ab29773bc91541b2a0fc769a7ddcff779c8b33138ee20c863c896b5b5de6c9a8bc44793e9b530e537aad125bede55699dceabf84c18a919555e24107d67521d3b5954200b72e1228970b69e21ed89f10accd92fdfd7ba071c59ba908def750a3086fbb2e4b755cda1621cc3b6ae716f631c895765cc53a280eb64653da2c8847f67f6db44a8f70df74463058745f0b49687f4bbced8d6fc926eeb3e2dd95cca7d8315353d111f6a63cf0024665c0803f919c887d8abbe0dc8d226233d5920be62d1df09521d1359f876ece264708fad0156671884d8054ff2ba05a7098c85f97a2d7237ff8ef7e22f785cc7f05954f05ba80e34badd2738d52293b8d2e878ffad93dc8734d8ecf349eeddba5da48b63f25771c50681462273c16",
//   "__v": 0
// }

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

app.use("/listing", listingRouter); //go to routes to understand them
// adding reviews
app.use("/listing/:id/review", reviewRouter);
//authentication
app.use("/", userRouter);

// lets create a generic route for when none of the above path match
app.use((req, res, next) => {
  // req.flash("error","The Page You Requested DNE")
  setTimeout(() => {
    res.redirect('/listing')
  }, 1000);
});

//error handling
// app.use((err, req, res, next) => {
//   res.send("something went wrong");
// });

app.use((err, req, res, next) => {
  let { status = 501, message = "something went wrong" } = err;
  // res.status(status).send(message)
  res.status(status).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
