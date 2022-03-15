const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lki96.mongodb.net/${process.env.MONGO_DATABASE}`;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connect');
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

module.exports = connectDB;
