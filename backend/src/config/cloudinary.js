const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hue_hotel_room_types",
    allowedFormats: ["jpg", "png", "jpeg", "webp", "heic"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

const uploadCloud = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
// const uploadCloud = multer({ storage });

module.exports = uploadCloud;
