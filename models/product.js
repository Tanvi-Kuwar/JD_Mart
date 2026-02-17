const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String, // Organic Wheat
  category: {
    type: String,
    enum: ["Grains","Pulses","Oilseeds","Spices"],
  },

  // seller: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"
  // },

  description:{
    type: String,
    maxLength: 200,
  },
  grade: {
    type: String,
    enum: ["A", "B", "C"],
    default: "A"
  },

  demandLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  pricePerQuintal: Number,
  oldPrice: Number,

  belowMarketPercent: Number, // 7%, 6%, etc.
  available:{
    type: Number,
    default: 0,
  },

  images: String,

  deliveryTime: {
    minDays: Number,
    maxDays: Number
  },

  outOfStock: {          
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Product", productSchema);