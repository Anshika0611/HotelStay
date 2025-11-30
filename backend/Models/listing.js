const mongoose=require('mongoose')
const Review=require('./review.js')
let Schema=mongoose.Schema

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        filename:{
            type:String,
            default: "listingimage",
        },
        url:{
        type:String,
        default:"https://news.airbnb.com/wp-content/uploads/sites/4/2019/06/PJM020719Q202_Luxe_WanakaNZ_LivingRoom_0264-LightOn_R1.jpg?fit=2500%2C1666",
        set:(v)=>v===""?
        "https://news.airbnb.com/wp-content/uploads/sites/4/2019/06/PJM020719Q202_Luxe_WanakaNZ_LivingRoom_0264-LightOn_R1.jpg?fit=2500%2C1666"
        :v,
        }
    },
    price:{
        type:Number
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review'
        }
    ]

})

// post mongoose m/w
listingSchema.post('findOneAndDelete',async(data)=>{
    if(data.reviews.length){
        await Review.deleteMany({_id:{$in:data.reviews}})
    }
}) 

const List=mongoose.model('List',listingSchema)

module.exports=List