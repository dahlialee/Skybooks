const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://hdieu12706:101321@dahllia.kvavpcj.mongodb.net/skybooks", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // dừng server nếu lỗi kết nối
  }
};

module.exports = connectDB;
