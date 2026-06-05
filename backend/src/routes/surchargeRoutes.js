const express = require("express");
const router = express.Router();
const surchargeController = require("../controllers/surchargeController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get("/", surchargeController.getAllRules);
router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  surchargeController.createRule,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  surchargeController.updateRule,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  surchargeController.deleteRule,
);

module.exports = router;
