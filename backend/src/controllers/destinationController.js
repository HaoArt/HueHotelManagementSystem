const Destination = require("../models/destinationModel");

exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.getAll();
    return res.status(200).json({ status: "OK", data: destinations });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải dữ liệu địa điểm du lịch" });
  }
};
