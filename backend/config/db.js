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

    await ensureIndexes();
    return { usingMemory };
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const ensureIndexes = async () => {
  try {
    await ensureCollectionIndex('monthlyrates', 'month_1_year_1', { userId: 1, month: 1, year: 1 }, { unique: true }, 'monthly rates');
    await ensureCollectionIndex('milkentries', 'date_1', { date: 1, userId: 1, buyerId: 1 }, { unique: true }, 'milk entries');
    await ensureCollectionIndex('curdentries', 'date_1', { date: 1, userId: 1, buyerId: 1 }, { unique: true }, 'curd entries');
  } catch (err) {
    console.warn('Unable to ensure indexes:', err.message);
  }
};

const ensureCollectionIndex = async (collectionName, oldIndexName, newIndexSpec, newIndexOptions, label) => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === oldIndexName);
    if (oldIndex) {
      await collection.dropIndex(oldIndexName);
      console.log(`Dropped old ${label} index ${oldIndexName}`);
    }
    await collection.createIndex(newIndexSpec, newIndexOptions);
    console.log(`Ensured ${label} index ${JSON.stringify(newIndexSpec)}`);
  } catch (err) {
    console.warn(`Unable to ensure ${label} index:`, err.message);
  }
};

module.exports = connectDB;
