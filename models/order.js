const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  priceAtOrder: {
    type: Number,
    required: true
  }
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [orderItemSchema],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered"],
    default: "Pending"
  },

  deliveryAddress: {
    type: String,
    required: true
  },

  expectedDelivery: {
    type: Date
  },

  timeline: [timelineSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate order id
orderSchema.pre("save", function () {
  if (!this.orderId) {
    this.orderId = "ORD-" + Date.now().toString(36).toUpperCase();
  }
});



module.exports = mongoose.model("Order", orderSchema);

