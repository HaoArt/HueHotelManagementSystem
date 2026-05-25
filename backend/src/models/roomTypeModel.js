const db = require("../config/db");

const RoomType = {
  getAll: async () => {
    const [roomTypes] = await db.query(`
      SELECT rt.*, 
      (SELECT COUNT(id) FROM rooms WHERE room_type_id = rt.id AND status != 'Maintenance') as available_count
      FROM room_types rt ORDER BY created_at DESC`);
    const [allImages] = await db.query("SELECT * FROM room_images");

    return roomTypes.map((rt) => {
      const images = allImages
        .filter((img) => img.room_type_id == rt.id)
        .map((img) => ({
          public_id: img.public_id,
          image_url: img.image_url,
        }));

      return {
        ...rt,
        images: images,
        image_url: images.length > 0 ? images[0].image_url : null,
      };
    });
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM room_types WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) return null;
    const [images] = await db.query(
      "SELECT image_url, public_id FROM room_images WHERE room_type_id = ?",
      [id],
    );
    return { ...rows[0], images };
  },

  create: async (data) => {
    const { type_name, base_price, area, capacity, description } = data;
    const [result] = await db.query(
      "INSERT INTO room_types (type_name, base_price, area, capacity, description) VALUES (?,?,?,?,?)",
      [type_name, base_price, area, capacity, description],
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { type_name, base_price, area, capacity, description } = data;
    return await db.query(
      "UPDATE room_types SET type_name=?, base_price=?, area=?, capacity=?, description=? WHERE id=?",
      [type_name, base_price, area, capacity, description, id],
    );
  },

  delete: async (id) => {
    return await db.query("DELETE FROM room_types WHERE id=?", [id]);
  },

  addImages: async (roomTypeId, images) => {
    if (!roomTypeId || !images || images.length === 0) return;

    const values = images.map((img) => [
      Number(roomTypeId),
      img.url,
      img.public_id,
    ]);

    return await db.query(
      "INSERT INTO room_images (room_type_id, image_url, public_id) VALUES ?",
      [values],
    );
  },

  getImagesByRoomTypeId: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM room_images WHERE room_type_id = ?",
      [id],
    );
    return rows;
  },
  deleteImagesByPublicId: async (publicIds) => {
    if (!publicIds || publicIds.length === 0) return;
    const placeholders = publicIds.map(() => "?").join(",");
    return await db.query(
      `DELETE FROM room_images WHERE public_id IN (${placeholders})`,
      publicIds,
    );
  },

  getTop: async (limit) => {
    const [roomTypes] = await db.query(
      "SELECT * FROM room_types ORDER BY base_price DESC LIMIT ?",
      [limit],
    );

    if (roomTypes.length === 0) return [];

    // Lấy ảnh của các hạng phòng vừa tìm được
    const typeIds = roomTypes.map((rt) => rt.id);
    const placeholders = typeIds.map(() => "?").join(",");
    const [allImages] = await db.query(
      `SELECT * FROM room_images WHERE room_type_id IN (${placeholders})`,
      typeIds,
    );

    return roomTypes.map((rt) => {
      const images = allImages
        .filter((img) => img.room_type_id === rt.id)
        .map((img) => ({
          public_id: img.public_id,
          image_url: img.image_url,
        }));

      return {
        ...rt,
        images: images,
        image_url: images.length > 0 ? images[0].image_url : null,
      };
    });
  },

  searchAvailable: async (check_in, check_out, roomType, capacity) => {
    let params = [];
    let countQuery = `(SELECT COUNT(r.id) FROM rooms r WHERE r.room_type_id = rt.id AND r.status = 'Available')`;

    if (check_in && check_out) {
      countQuery = `(
        SELECT COUNT(r.id) FROM rooms r
        WHERE r.room_type_id = rt.id AND r.status != 'Maintenance'
        AND r.id NOT IN (
          SELECT room_id FROM bookings
          WHERE status NOT IN ('Cancelled', 'Checked_out')
          AND (check_in_date < ? AND check_out_date > ?)
        )
      )`;
      params.push(check_out, check_in);
    }
    let query = `SELECT rt.*, ${countQuery} as available_count FROM room_types rt WHERE rt.capacity >= ?`;
    params.push(capacity);
    if (roomType && roomType !== "all") {
      query += ` AND rt.type_name LIKE ?`;
      params.push(`%${roomType}%`);
    }
    const [roomTypes] = await db.query(query, params);

    if (roomTypes.length === 0) return [];

    const typeIds = roomTypes.map((rt) => rt.id);
    const placeholders = typeIds.map(() => "?").join(",");
    const [allImages] = await db.query(
      `SELECT * FROM room_images WHERE room_type_id IN (${placeholders})`,
      typeIds,
    );

    return roomTypes.map((rt) => {
      const images = allImages
        .filter((img) => img.room_type_id === rt.id)
        .map((img) => ({
          public_id: img.public_id,
          image_url: img.image_url,
        }));

      return {
        ...rt,
        images: images,
        image_url: images.length > 0 ? images[0].image_url : null,
      };
    });
  },
};

module.exports = RoomType;
