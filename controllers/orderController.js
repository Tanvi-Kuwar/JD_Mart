const Order = require("../models/order");

// ======================
// Orders Page
// ======================
module.exports.index = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    const stats = {
      total: orders.length,
      transit: orders.filter(
        (order) => order.status === "In Transit"
      ).length,
      delivered: orders.filter(
        (order) => order.status === "Delivered"
      ).length,
      pending: orders.filter(
        (order) => order.status === "Pending"
      ).length,
    };

    res.render("orders", {
      orders,
      user: req.user,
      stats,
    });

  } catch (err) {
    console.log("ORDERS PAGE ERROR:", err);
    res.redirect("/products");
  }
};

// ======================
// Order Success Page
// ======================
module.exports.success = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.id,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.redirect("/products");
    }

    res.render("order-success", {
      order,
      user: req.user,
    });

  } catch (err) {
    console.log("ORDER SUCCESS ERROR:", err);
    res.redirect("/products");
  }
};