const mongoose = require('mongoose');

const connectDB = async () => {
  const LOCAL_DB = process.env.MONGODB_URI;
  const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lki96.mongodb.net/${process.env.MONGO_DATABASE}`;

  try {
    // await mongoose.connect(MONGODB_URI);
    await mongoose.connect(LOCAL_DB);
    console.log('MongoDB connect');
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

module.exports = connectDB;
