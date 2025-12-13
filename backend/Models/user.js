const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});
// here username and pswd are not defined in schema because passportLocalMongoose by default assigns username and pswd along with salt and hashing
userSchema.plugin(passportLocalMongoose)

module.exports= mongoose.model("User", userSchema);

