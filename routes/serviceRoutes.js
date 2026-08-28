const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

// عام — بيستخدمه الموقع (index.html) من غير توكن
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);

// محمي — لوحة التحكم بس
router.post("/", requireAdmin, upload.single("image"), serviceController.createService);
router.put("/:id", requireAdmin, upload.single("image"), serviceController.updateService);
router.delete("/:id", requireAdmin, serviceController.deleteService);

module.exports = router;