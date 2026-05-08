const db = require("../config/db");

const Destination = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM destinations ORDER BY distance_km ASC");
    return rows;
  }
};

module.exports = Destination;