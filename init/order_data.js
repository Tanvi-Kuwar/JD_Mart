const Order = require("./models/order");

await Order.create({
  user: "697a3ded6dedb20f90b5901a",
  items: [{
    product: "6978e186b584e45699e363f6",
    quantity: 10,
    priceAtOrder: 2800
  }],
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