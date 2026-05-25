const cloudinary = require("cloudinary").v2;
const Review = require("../models/reviewModel");
const RoomType = require("../models/roomTypeModel");


exports.getAllRoomTypes = async (req, res) => {
  try {
    const data = await RoomType.getAll();
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
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

    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        url: file.path, 
        public_id: file.filename, 
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


    await RoomType.update(id, textData);


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


    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      await RoomType.addImages(id, imageData);
    }

    return res.status(200).json({ status: "OK", message: "Cập nhật thành công!" });
  } catch (error) {
    console.error("Lỗi Controller Update:", error);
    return res
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
    return res.status(200).json({ status: "OK", message: "Xóa thành công!" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
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
    const { id } = req.params; 
    const reviews = await Review.getByRoomTypeId(id);
    return res.status(200).json({ status: "OK", data: reviews });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi khi tải đánh giá" });
  }
};

exports.getTopRoomTypes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 3;

    const data = await RoomType.getTop(limit);
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.searchRoomTypes = async (req, res) => {
  try {
    const { checkIn, checkOut, roomType, capacity } = req.query;
    const reqCapacity = parseInt(capacity) || 1;
    const data = await RoomType.searchAvailable(
      checkIn,
      checkOut,
      roomType,
      reqCapacity,
    );

    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    console.error("Lỗi tìm kiếm phòng:", error);
    return res.status(500).json({ status: "error", message: "Lỗi tìm kiếm phòng" });
  }
};
