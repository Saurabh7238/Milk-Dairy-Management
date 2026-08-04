const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const adminExists = await Admin.findOne({ username });
  if (adminExists) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({
    username,
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Seeded default admin account: ${username}/${password}`);
};

module.exports = seedAdmin;
