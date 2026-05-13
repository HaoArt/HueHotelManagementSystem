const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
router.get("/", configController.getConfigs);

router.put(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  configController.updateConfigs,
);

module.exports = router;
