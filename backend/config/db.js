const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/netflix_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB Atlas Connection Error: ${err.message}`);
    try {
      const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/netflix_db';
      const localConn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Local Connected: ${localConn.connection.host} / ${localConn.connection.name}`);
      return localConn;
    } catch (localErr) {
      console.error(`Local MongoDB Connection Error: ${localErr.message}`);
      throw localErr;
    }
  }
};

module.exports = connectDB;
