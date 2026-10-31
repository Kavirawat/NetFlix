const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.mongdb_URI ||
    process.env.MONGDB_URI ||
    process.env.mongo_uri ||
    process.env.mongodb_uri;

  if (!uri) {
    console.error('MongoDB Error: No MongoDB URI found in environment variables (checked MONGO_URI, MONGODB_URI, mongdb_URI).');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
  }
};

module.exports = connectDB;
