const express=require('express');
const app=express();
const path=require('path')
const mongoose=require('mongoose')
const List=require('./Models/listing')
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')

app.use(methodOverride('_method'))
const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust'
main()
.then(()=>
    {console.log("connected to db");

    }).catch((err)=>
        {console.log(err);

        })
async function main(){
    await mongoose.connect(MONGO_URL)
}
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('working')
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

// home page that has list of all places

app.get('/listing',async(req,res)=>{
    let list=await List.find({})
    res.render('./listings/index.ejs',{list})
})
//creating new listing
app.get('/listing/new',(req,res)=>{
    res.render('listings/new.ejs')
})
app.post('/listing',async(req,res)=>{
    // console.log(req.body);
    // let{title,description,image,price,location,country}=req.body
    // console.log(title,description,image,price,location,country);
    // another way
    let listing=req.body.listing;
     if (!listing.image || listing.image.trim() === "") {
        listing.image = undefined;     // allow schema default to apply
    } else {
        listing.image = {
            filename: "listingimage",
            url: listing.image
        };
    }
    const newListing=new List(listing)
    await newListing.save()
    // console.log(newListing);
    res.redirect('/listing')
})
//showing individual listing from the list
app.get('/listing/:id',async(req,res)=>{
    let {id}=req.params
    let post=await List.findById(id)
    res.render('listings/show',{post})
})
// edit the existing listing
app.get('/listing/:id/edit',async(req,res)=>{
    let {id}=req.params
    let list=await List.findById(id)
    res.render('listings/edit.ejs',{list})
})
app.patch('/listing/:id',async(req,res)=>{
    let {id}=req.params
    let listing=req.body.listing
    // console.log(...req.body.listing);
    if (listing.image && listing.image.trim() !== "") {
    listing.image = {
      filename: "listingimage",
      url: listing.image
    };
  } else {
    // If empty → keep existing image (don’t overwrite)
    delete listing.image;
  }
    await List.findByIdAndUpdate(id,listing)
    console.log('updated');
    res.redirect(`/listing/${id}`)
})
//delete the listing
app.delete('/listing/:id',async(req,res)=>{
    let {id}=req.params
    await List.findByIdAndDelete(id)
    console.log("deleted");
    res.redirect('/listing')
})





app.listen(8080,()=>{
    console.log('Server running on port 8080');
})