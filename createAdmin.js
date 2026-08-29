// createAdmin.js
// سكريبت لإنشاء حساب أدمن جديد في قاعدة البيانات
// طريقة الاستخدام:
//   node createAdmin.js "email@example.com" "password123"

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, Admin } = require("./models");

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("❌ استخدم الأمر كده: node createAdmin.js email password");
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log("✅ متصل بقاعدة البيانات");

    // تأكد إن الجداول موجودة
    await sequelize.sync();

    // تحقق هل الأدمن موجود بالفعل
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      console.log("⚠️ يوجد حساب بهذا الإيميل بالفعل:", email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });

    console.log("✅ تم إنشاء حساب الأدمن بنجاح:");
    console.log("   الإيميل:", admin.email);
    console.log("   الآيدي:", admin.id);
    process.exit(0);
  } catch (err) {
    console.error("❌ حصل خطأ:");
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
