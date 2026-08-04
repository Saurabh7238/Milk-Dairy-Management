const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.log('Skipping admin seed: ADMIN_USERNAME and ADMIN_PASSWORD must be set.');
    return;
  }

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

  console.log(`Seeded admin account: ${username}`);
};

module.exports = seedAdmin;
