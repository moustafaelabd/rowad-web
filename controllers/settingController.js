const { Setting } = require("../models");

/* =========================================================
   جلب الإعدادات (عام - بدون توكن)
   بيتنشئ صف افتراضي لو مفيش صف أصلاً
========================================================= */
async function getSettings(req, res) {
  try {
    let settings = await Setting.findByPk(1);

    if (!settings) {
      settings = await Setting.create({ id: 1 });
    }

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "تعذر جلب الإعدادات" });
  }
}

/* =========================================================
   تعديل الإعدادات (محمي - يحتاج توكن أدمن)
========================================================= */
async function updateSettings(req, res) {
  try {
    let settings = await Setting.findByPk(1);

    if (!settings) {
      settings = await Setting.create({ id: 1 });
    }

    const fields = [
      "siteName",
      "siteNameEn",
      "phone",
      "phoneIntl",
      "whatsapp",
      "email",
      "address",
      "facebook",
      "instagram",
      "twitter",
      "linkedin",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    // لو اتبعتت صورة لوجو جديدة
    if (req.file) {
      settings.logo = req.file.filename;
    }

    await settings.save();

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "تعذر تعديل الإعدادات" });
  }
}

module.exports = { getSettings, updateSettings };