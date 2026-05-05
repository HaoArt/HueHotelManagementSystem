const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get("/", serviceController.getAllServices);
router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  serviceController.addService,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  serviceController.updateService,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  serviceController.deleteService,
);

module.exports = router;
