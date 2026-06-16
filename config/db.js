const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;


// ============================================================
// PURPOSE: Connects the app to MongoDB (the database).
// HOW IT WORKS:
//   1. Reads the MONGO_URI from .env (contains the database address).
//   2. Calls mongoose.connect() which opens a connection to MongoDB.
//   3. If connection succeeds, it logs "MongoDB Connected".
//   4. If connection fails, it prints the error and shuts down
//      the server (process.exit(1)) because the app cannot run
//      without a working database.
// ============================================================
