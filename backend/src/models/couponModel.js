const db = require("../config/db");

const Coupon = {
  findByCode: async (code) => {
    const [rows] = await db.query(
      'SELECT * FROM Coupons WHERE code = ? AND status = "Active"',
      [code],
    );
    return rows[0];
  },

  incrementUsage: async (id) => {
    return await db.query(
      "UPDATE Coupons SET used_count = used_count + 1 WHERE id = ?",
      [id],
    );
  },
  findActive: async () => {
    const [rows] = await db.query(
      `
      SELECT * 
      FROM coupons 
      WHERE status = 'Active' 
      AND (expiry_date IS NULL OR expiry_date >= NOW())
      AND used_count < usage_limit
    `,
    );
    return rows;
  },
  findActiveForUser: async (user_id) => {
    const [rows] = await db.query(
      `
      SELECT c.* 
      FROM coupons c
      WHERE c.status = 'Active' 
      AND (c.expiry_date IS NULL OR c.expiry_date >= NOW())
      AND c.used_count < c.usage_limit
      AND c.id NOT IN (
        SELECT coupon_id 
        FROM bookings 
        WHERE user_id = ? AND status != 'Cancelled' AND coupon_id IS NOT NULL
      )
      `,
      [user_id],
    );
    return rows;
  },
  findAll: async () => {
    const [rows] = await db.query("SELECT * FROM coupons");
    return rows;
  },
  create: async (data) => {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      expiry_date,
      usage_limit,
      status,
    } = data;
    const maxDiscount = max_discount_value === "" ? null : max_discount_value;
    const minOrder = min_order_value === "" ? 0 : min_order_value;

    const finalDescription =
      description && description.trim() !== ""
        ? description
        : "Ưu đãi dành riêng cho thành viên khách sạn Huế Hotel. Áp dụng cho mọi loại phòng.";
    const [result] = await db.query(
      "INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount_value, expiry_date, usage_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        code,
        finalDescription,
        discount_type,
        discount_value,
        minOrder,
        maxDiscount,
        expiry_date,
        usage_limit,
        status || "Active",
      ],
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      expiry_date,
      usage_limit,
      status,
    } = data;
    const maxDiscount = max_discount_value === "" ? null : max_discount_value;
    const minOrder = min_order_value === "" ? 0 : min_order_value;

    const finalDescription =
      description && description.trim() !== ""
        ? description
        : "Ưu đãi dành riêng cho thành viên khách sạn Huế Hotel. Áp dụng cho mọi loại phòng.";
    return await db.query(
      "UPDATE coupons SET code=?, description=?, discount_type=?, discount_value=?, min_order_value=?, max_discount_value=?, expiry_date=?, usage_limit=?, status=? WHERE id=?",
      [
        code,
        finalDescription,
        discount_type,
        discount_value,
        minOrder,
        maxDiscount,
        expiry_date,
        usage_limit,
        status,
        id,
      ],
    );
  },

  delete: async (id) => {
    return await db.query("DELETE FROM coupons WHERE id=?", [id]);
  },
};

module.exports = Coupon;
