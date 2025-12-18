const mongoose=require('mongoose')
const List=require('../Models/listing')
const initData=require('./data')

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
//function to initalise data in db
const initdb= async()=>{
    await List.deleteMany({})
    // console.log(initialdata.data);

    //initdata ke hr object ke liye hmare pass hr obj ki detail ayegi(...obj) and usme hm owner naam ki ek new field add kr denge
    initData.data=initData.data.map((obj)=>({...obj,owner:'6943a180c0038bde8fb61306'}))
    await List.insertMany(initData.data)
    console.log('data was initialized');
}

initdb();
