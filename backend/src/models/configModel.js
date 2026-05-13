const db = require("../config/db");

const SystemConfig = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM system_configs ORDER BY id ASC");
    return rows;
  },
  update: async (key, value) => {
    return await db.query("UPDATE system_configs SET config_value = ? WHERE config_key = ?", [value, key]);
  }
};

module.exports = SystemConfig;