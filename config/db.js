const mongoose = require('mongoose');

const connectDB = async () => {
  const LOCAL_DB = process.env.MONGODB_URIL;
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI);
    // await mongoose.connect(LOCAL_DB);
    console.log('MongoDB connect');
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

module.exports = connectDB;
