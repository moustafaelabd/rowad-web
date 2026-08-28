const express = require("express");
const router = express.Router();
const multer = require("multer");
const settingsController = require("../controllers/settingController"); // من غير s
// خزّن الصور في public/uploads زي باقي الموديولز عندك
const upload = multer({ dest: "public/uploads/" });

router.get("/", settingsController.getSettings);
router.put("/", upload.single("logo"), settingsController.updateSettings);

module.exports = router;