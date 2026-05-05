const uploadCloud = require("../config/cloudinary");
const multer = require("multer");

const uploadMiddleware = (req, res, next) => {
  // Cho phép tối đa 10 ảnh mỗi lần upload
  const upload = uploadCloud.array("images", 10);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "error",
          message: "Ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.",
        });
      }
      return res.status(400).json({ status: "error", message: err.message });
    } else if (err) {
      return res.status(500).json({
        status: "error",
        message: "Lỗi hệ thống khi tải ảnh lên Cloudinary",
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;
