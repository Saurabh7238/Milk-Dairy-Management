const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

function ensureDatabaseName(uri, defaultDb = 'milk-dairy') {
  if (!uri) return uri;
  const [base, query] = uri.split('?');
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;

  // If there's already a DB name after the host, leave as-is
  // e.g. mongodb+srv://user:pass@cluster0.qc29hhb.mongodb.net/mydb
  const hasDb = /\/[^\/?]+$/.test(normalizedBase);
  if (hasDb) return uri;

  return `${normalizedBase}/${defaultDb}${query ? '?' + query : ''}`;
}

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    let usingMemory = false;

    if (!mongoUri) {
      if (isProduction) {
        throw new Error('MONGO_URI is required in production');
      }
      const memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      usingMemory = true;
      console.log('Using in-memory MongoDB for local development');
    } else {
      const normalized = ensureDatabaseName(mongoUri);
      if (normalized !== mongoUri) {
        console.log('Appended default DB name to MONGO_URI');
        mongoUri = normalized;
      }
      try {
        const masked = mongoUri.replace(/:\/\/.+@/, '://<credentials>@');
        console.log('Connecting to MongoDB at', masked);
      } catch (e) {
        console.log('Connecting to MongoDB (masked)');
      }
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');

    await ensureMonthlyRateIndex();
    return { usingMemory };
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const ensureMonthlyRateIndex = async () => {
  try {
    const collection = mongoose.connection.collection('monthlyrates');
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === 'month_1_year_1');
    if (oldIndex) {
      await collection.dropIndex('month_1_year_1');
      console.log('Dropped old monthly rates month/year unique index');
    }
    await collection.createIndex({ userId: 1, month: 1, year: 1 }, { unique: true });
    console.log('Ensured monthly rates userId/month/year unique index');
  } catch (err) {
    console.warn('Unable to ensure monthly rate index:', err.message);
  }
};

module.exports = connectDB;
