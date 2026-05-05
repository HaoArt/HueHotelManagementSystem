const Room = require("../models/roomModel");
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.getAllWithType();
    return res.status(200).json({ status: "OK", data: rooms });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
exports.addRoom = async (req, res) => {
  try {
    const { room_number, room_type_id, description } = req.body;
    const checkRoom = await Room.findByNumber(room_number);
    if (checkRoom) {
      return res
        .status(400)
        .json({ status: "error", message: "Số phòng này đã tồn tại!" });
    }
    await Room.create({ room_number, room_type_id, description });
    return res
      .status(201)
      .json({ status: "OK", message: "Thêm phòng thành công!" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Room.updateStatus(id, status);
    return res.status(200).json({
      status: "OK",
      message: `Đã chuyển trạng thái phòng sang ${status}`,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, room_type_id, description } = req.body;

    const checkRoom = await Room.findByNumber(room_number);
    if (checkRoom && checkRoom.id !== parseInt(id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Số phòng này đã tồn tại!" });
    }

    await Room.update(id, { room_number, room_type_id, description });
    res
      .status(200)
      .json({ status: "OK", message: "Cập nhật phòng thành công!" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await Room.delete(id);
    return res
      .status(200)
      .json({ status: "OK", message: "Xóa phòng thành công!" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
