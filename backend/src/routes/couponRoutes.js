const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get("/my-active", verifyToken, couponController.getActiveCouponsForUser);
router.get("/active", couponController.getActiveCoupons);
router.get("/", couponController.getAllCoupons);
router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  couponController.createCoupon,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  couponController.updateCoupon,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  couponController.deleteCoupon,
);

module.exports = router;
