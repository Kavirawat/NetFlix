const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;
