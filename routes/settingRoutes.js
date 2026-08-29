const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // نفس الملف اللي بيستخدمه المنتجات
const settingsController = require("../controllers/settingController"); // من غير s

router.get("/", settingsController.getSettings);
router.put("/", upload.single("logo"), settingsController.updateSettings);

module.exports = router;
