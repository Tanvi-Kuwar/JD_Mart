const Products = require("../models/product");
const Order = require("../models/order");
const Notification = require("../models/notification");

// ======================
// Checkout Page
// ======================
module.exports.checkout = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    const qty = parseInt(req.query.qty || 1);

    if (!product || qty < 1) {
      return res.redirect("/products");
    }

    const subtotal = product.pricePerQuintal * qty;
    const deliveryFee = subtotal >= 5000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    res.render("checkout", {
      product,
      qty,
      subtotal,
      deliveryFee,
      total,
    });

  } catch (err) {
    console.log("CHECKOUT ERROR:", err);
    res.redirect("/products");
  }
};

// ======================
// Address Page
// ======================
module.exports.addressPage = async (req, res) => {
  try {
    const product = await Products.findById(req.params.productId);
    const qty = parseInt(req.query.qty) || 1;

    if (!product || qty < 1 || qty > product.available) {
      return res.redirect("/products");
    }

    const subtotal = qty * product.pricePerQuintal;
    const deliveryFee = subtotal >= 5000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    res.render("address", {
      product,
      qty,
      subtotal,
      deliveryFee,
      total,
      user: req.user,
    });

  } catch (err) {
    console.log("ADDRESS PAGE ERROR:", err);
    res.redirect("/products");
  }
};

// ======================
// Save Address
// ======================
module.exports.saveAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, address, notes } = req.body;

    const qty = parseInt(quantity || 1);

    if (qty < 1) {
      return res.redirect("/products");
    }

    const product = await Products.findById(id);

    if (!product) {
      return res.redirect("/products");
    }

    const subtotal = product.pricePerQuintal * qty;
    const deliveryFee = subtotal >= 5000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    req.session.checkout = {
      productId: id,
      quantity: qty,
      address: address || req.user.defaultAddress,
      notes,
      subtotal,
      deliveryFee,
      total,
    };

    res.redirect(`/checkout/review/${id}`);

  } catch (err) {
    console.log("SAVE ADDRESS ERROR:", err);
    res.redirect("/products");
  }
};

// ======================
// Review Page
// ======================
module.exports.reviewPage = async (req, res) => {
  try {
    const checkout = req.session.checkout;

    if (!checkout || checkout.productId !== req.params.id) {
      return res.redirect("/products");
    }

    const product = await Products.findById(checkout.productId);

    if (!product) {
      return res.redirect("/products");
    }

    res.render("review", {
      product,
      qty: checkout.quantity,
      subtotal: checkout.subtotal,
      deliveryFee: checkout.deliveryFee,
      total: checkout.total,
      address: checkout.address,
      user: req.user,
    });

  } catch (err) {
    console.log("REVIEW PAGE ERROR:", err);
    res.redirect("/products");
  }
};

// ======================
// Place Order
// ======================
module.exports.placeOrder = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    const qty = parseInt(req.body.quantity);

    if (!product || qty < 1 || qty > product.available) {
      return res.redirect("/products");
    }

    const subtotal = qty * product.pricePerQuintal;
    const deliveryFee = subtotal >= 5000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    const order = new Order({
      user: req.user._id,
      items: [
        {
          product: product._id,
          productName: product.name,
          quantity: qty,
          priceAtOrder: product.pricePerQuintal,
        },
      ],
      totalAmount: total,
      status: "Pending",
      deliveryAddress: req.body.address,
      expectedDelivery: new Date(
        Date.now() + product.deliveryTime.maxDays * 86400000
      ),
      timeline: [
        { status: "Placed" },
        { status: "Confirmed" },
      ],
    });

    product.available -= qty;

    await order.save();
    await product.save();

    await Notification.create({
      user: req.user._id,
      order: order._id,
      product: product._id,
      type: "order",
      message: `Your order ${order.orderId} has been placed successfully.`,
      status: "unread",
    });

    res.redirect(`/orders/success/${order.orderId}`);

  } catch (err) {
    console.error("PLACE ORDER ERROR:", err);
    res.redirect("/products");
  }
};