const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Bạn cần đăng nhập để thực hiện thao tác này!",
    });
  }
  try {
    const bearerToken = token.split(" ")[1];
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      status: "error",
      message: "Phiên bản đăng nhập không hợp lệ hoặc đã hết hạn!",
    });
  }
};

exports.authorizeRoles = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền truy cập vào tài nguyên này!",
      });
    }
    next();
  };
};
