const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//we will configure cloudinary and backend ie, connect them
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// we will define a storage on cloudinary where our uploaded data will be stored
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wanderlust_DEV",
    allowedFormatS: ['png', 'jpg', 'jpeg', 'pdf'],
  },
});

module.exports={
    cloudinary,
    storage
}
