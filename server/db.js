// db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("auth-db"); // Change this to your DB name
    console.log("✅ Connected to MongoDB Atlas");
  }
  return db;
}

module.exports = connectDB;
