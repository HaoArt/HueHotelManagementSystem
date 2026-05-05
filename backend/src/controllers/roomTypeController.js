const cloudinary = require("cloudinary").v2;
const Review = require("../models/reviewModel");
const RoomType = require("../models/roomTypeModel");


exports.getAllRoomTypes = async (req, res) => {
  try {
    const data = await RoomType.getAll();
    res.status(200).json({ status: "OK", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createRoomType = async (req, res) => {
  try {
    const { type_name, base_price, capacity, description, area } = req.body;

    const roomTypeId = await RoomType.create({
      type_name,
      base_price,
      area: area || 0,
      capacity,
      description,
    });

    // Kiểm tra xem Multer có nhận được file không[cite: 52]
    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        url: file.path, // Link từ Cloudinary[cite: 42]
        public_id: file.filename, // Public ID từ Cloudinary
      }));
      await RoomType.addImages(roomTypeId, imageData);
    }

    return res
      .status(201)
      .json({ status: "OK", message: "Tạo hạng phòng thành công!" });
  } catch (error) {
    console.error("Lỗi Controller Create:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi tạo mới" });
  }
};

exports.updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const { images_to_delete, ...textData } = req.body;

    // 1. Cập nhật text trước
    await RoomType.update(id, textData);

    // 2. Xử lý xóa ảnh (Nếu có)[cite: 52]
    if (images_to_delete && images_to_delete !== "[]") {
      const pids =
        typeof images_to_delete === "string"
          ? JSON.parse(images_to_delete)
          : images_to_delete;
      if (pids.length > 0) {
        await Promise.all(pids.map((pid) => cloudinary.uploader.destroy(pid)));
        await RoomType.deleteImagesByPublicId(pids);
      }
    }

    // 3. Xử lý thêm ảnh mới
    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      await RoomType.addImages(id, imageData);
    }

    res.status(200).json({ status: "OK", message: "Cập nhật thành công!" });
  } catch (error) {
    console.error("Lỗi Controller Update:", error);
    res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi cập nhật" });
  }
};
exports.deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await RoomType.getImagesByRoomTypeId(id);
    const deleteImagePromises = images.map((image) =>
      cloudinary.uploader.destroy(image.public_id),
    );
    await Promise.all(deleteImagePromises);
    await RoomType.delete(id);
    res.status(200).json({ status: "OK", message: "Xóa thành công!" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.getRoomTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.getById(id);

    if (!roomType || !roomType.id) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy loại phòng này!" });
    }

    return res.status(200).json({ status: "OK", data: roomType });
  } catch (error) {
    console.error("Lỗi lấy chi tiết phòng:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.getReviewsByRoomType = async (req, res) => {
  try {
    const { id } = req.params; // room_type_id
    const reviews = await Review.getByRoomTypeId(id);
    res.status(200).json({ status: "OK", data: reviews });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi khi tải đánh giá" });
  }
};

exports.getTopRoomTypes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 3;
    // Bạn cần tạo hàm getTop(limit) trong model,
    // hàm này sẽ truy vấn SQL để lấy các phòng có lượt đặt cao nhất.
    const data = await RoomType.getTop(limit);
    res.status(200).json({ status: "OK", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Thêm hàm này
exports.searchRoomTypes = async (req, res) => {
  try {
    // Lấy query parameters từ URL
    const { checkIn, checkOut, roomType, capacity } = req.query;

    // Parse capacity ra số nguyên, mặc định là 1 nếu không truyền
    const reqCapacity = parseInt(capacity) || 1;

    const data = await RoomType.searchAvailable(
      checkIn,
      checkOut,
      roomType,
      reqCapacity,
    );

    res.status(200).json({ status: "OK", data });
  } catch (error) {
    console.error("Lỗi tìm kiếm phòng:", error);
    res.status(500).json({ status: "error", message: "Lỗi tìm kiếm phòng" });
  }
};
