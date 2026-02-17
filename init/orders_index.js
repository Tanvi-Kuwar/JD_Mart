const mongoose = require("mongoose");
const Order = require("../models/order");


// 🔁 Replace these with real IDs from your DB
const USER_ID = "697a3ded6dedb20f90b5901a";
const PRODUCT_ID = "6978e186b584e45699e363f6";

const MONGO_URL = "mongodb://127.0.0.1:27017/jdmart"; // change if needed

async function seedOrder() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");

    const order = await Order.create({
      user: USER_ID,
      items: [
        {
          product: PRODUCT_ID,
          quantity: 10,
          priceAtOrder: 2800
        }
      ],
      totalAmount: 28000,
      status: "Delivered",
      deliveryAddress: "123 Market Street, Mumbai, Maharashtra 400001",
      expectedDelivery: new Date("2024-01-13"),
      timeline: [
        { status: "Placed", date: new Date("2024-01-10") },
        { status: "Confirmed", date: new Date("2024-01-10") },
        { status: "Processing", date: new Date("2024-01-11") },
        { status: "Shipped", date: new Date("2024-01-12") },
        { status: "Delivered", date: new Date("2024-01-13") }
      ]
    });

    console.log("✅ Order Inserted Successfully:");
    console.log(order);

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting order:", err);
    mongoose.connection.close();
  }
}

seedOrder();
