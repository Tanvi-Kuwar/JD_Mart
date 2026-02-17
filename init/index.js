const mongoose = require("mongoose");
// const { users } = require("./user_data");
// const User = require("../models/user");
const { products } = require("./product_data");
const Product = require("../models/product");
// const bcrypt = require("bcryptjs");

const MONGO_URL = "mongodb://127.0.0.1:27017/jdmart";

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to DB");
}

/*
// Initialize Users
const initUsersData = async () => {
  await User.deleteMany({});

  // Hash passwords before inserting
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
    }))
  );

  const insertedUsers = await User.insertMany(usersWithHashedPasswords);
  console.log("✅ Users initialized");
  return insertedUsers;
};

// Seed Database
async function seedDB() {
  await main();
  await initUsersData();
  mongoose.connection.close();
  console.log("✅ Database seeding complete");
}

seedDB().catch((err) => console.error(err));

*/



const initDB = async () => {
  try {
    await main();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products Seeded Successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};
initDB();


