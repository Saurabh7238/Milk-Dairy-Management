const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

function ensureDatabaseName(uri, defaultDb = 'milk-dairy') {
  if (!uri) return uri;
  // If there's already a path segment after the host (i.e. a DB name), leave as-is
  // This regex checks for '/<dbname>' before optional query string
  const hasDb = /\/[^\/?]+(\?|$)/.test(uri);
  if (hasDb) return uri;

  // Insert default database name before any query string
  const [base, query] = uri.split('?');
  return `${base}/${defaultDb}${query ? '?' + query : ''}`;
}

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      const memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log('Using in-memory MongoDB for local development');
    } else {
      // Ensure a database name exists in the URI so deployments use the intended DB
      const normalized = ensureDatabaseName(mongoUri);
      if (normalized !== mongoUri) {
        console.log('Appended default DB name to MONGO_URI');
        mongoUri = normalized;
      }
      // Masked log for diagnosis (don't print credentials)
      try {
        const masked = mongoUri.replace(/:\/\/.+@/, '://<credentials>@');
        console.log('Connecting to MongoDB at', masked);
      } catch (e) {
        console.log('Connecting to MongoDB (masked)');
      }
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
