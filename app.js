const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Users = require ("./models/user.js");
const Products = require ("./models/product.js");  
const Order = require("./models/order.js");
const Notification = require("./models/notification.js");
const getDashboardStats = require("./models/dashboardStat.js");
const ejsMate = require("ejs-mate");


const path = require("path");
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const bcrypt = require("bcrypt");


const MONGO_URL = "mongodb://127.0.0.1:27017/jdmart"; 


app.engine("ejs", ejsMate); 
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URL
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(async (req, res, next) => {
  res.locals.user = null; // ALWAYS defined

  if (req.session.userId) {
    req.user = await Users.findById(req.session.userId);
    res.locals.user = req.user;
  }

  next();
});



app.use(async (req, res, next) => {
  if (req.user) {
    try {
      // Last 5 notifications (for UI list)
      const notifications = await Notification.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      // Count ONLY unread notifications
      const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        status: "unread",
      });

      res.locals.notifications = notifications;
      res.locals.unreadCount = unreadCount;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.locals.notifications = [];
      res.locals.unreadCount = 0;
    }
  } else {
    res.locals.notifications = [];
    res.locals.unreadCount = 0;
  }

  next();
});

main()
    .then(()=>{
        console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    })

async function main(){
    await mongoose.connect(MONGO_URL);
}


function isLoggedIn(req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
}

// Login form
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Login User
app.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await Users.findOne({
      $or: [{ email: login }, { phone: login }]
    });

    if (!user) {
      console.log("No user found");
      return res.redirect("/login");
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.redirect("/login");
    }

    req.session.userId = user._id;

    req.session.save(() => {
      res.redirect("/products");
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.redirect("/login");
  }
});

// OTP Login Page (phone input)
app.get("/otp-login", (req, res) => {
  res.render("otp", { step: false }); // step=false means show phone input
});

// Send OTP (after submitting phone)
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const user = await Users.findOne({ phone });
  if (!user) {
    console.log("User not found for OTP login");
    return res.redirect("/otp-login");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  req.session.otp = otp;
  req.session.otpPhone = phone;

  console.log("=================================");
  console.log("OTP FOR LOGIN:", otp);
  console.log("=================================");

  // Pass step=true to show OTP verification
  res.render("otp", { step: true, phone });
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  if (parseInt(otp) !== req.session.otp) {
    console.log("OTP INVALID");
    return res.redirect("/otp-login");
  }

  const user = await Users.findOne({ phone: req.session.otpPhone });

  req.session.userId = user._id;

  // Clear OTP session data
  req.session.otp = null;
  req.session.otpPhone = null;

  req.session.save(() => {
    res.redirect("/products");
  });
});


// Register Form
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Register User
app.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, business, businessType, password, confirm,defaultAddress } = req.body;

    if (password !== confirm) {
      return res.redirect("/register");
    }

    const userExists = await Users.findOne({
      $or: [{ email }, { phone }]
    });

    if (userExists) {
      return res.redirect("/register");
    }

    const newUser = new Users({
      fullName,
      phone,
      email,
      business,
      businessType,
      password,
      defaultAddress
    });

    await newUser.save();

    req.session.userId = newUser._id;

    req.session.save(() => {
      res.redirect("/products");
    });

  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});

// Forget password
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password.ejs");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Products Route
app.get("/products", isLoggedIn, async (req, res) => {
  try {
    const allProducts = await Products.find({}).sort({ time: -1 });
    const dashboardStats = await getDashboardStats(); // fetch stats

    res.render("index.ejs", { allProducts, dashboardStats });
  } catch (err) {
    console.log("Error fetching products or stats:", err);
    res.send("Something went wrong");
  }
});


// Orders Route
app.get("/orders", isLoggedIn, async (req, res) => {

  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });

  const stats = {
    total: orders.length,
    transit: orders.filter(o => o.status === "In Transit").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    pending: orders.filter(o => o.status === "Pending").length
  };

  res.render("orders", {
    orders,
    user: req.user,
    stats
  });
});



app.get("/notifications", isLoggedIn, async (req, res) => {
  // Fetch all notifications (latest first)
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  // Mark unread notifications as read
  await Notification.updateMany(
    { user: req.user._id, status: "unread" },
    { status: "read" }
  );

  res.render("notifications", {
    notifications,
    user: req.user,
  });
});


// ORDER SUCCESS PAGE
app.get("/order-success/:id", isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.id,
      user: req.user._id
    }).populate("items.product");

    if (!order) return res.redirect("/products");

    res.render("order-success", {
      order,
      user: req.user
    });

  } catch (err) {
    console.log("ORDER SUCCESS ERROR:", err);
    res.redirect("/products");
  }
});


app.get("/checkout/:id", isLoggedIn, async (req, res) => {
  const product = await Products.findById(req.params.id);
  const qty = parseInt(req.query.qty || 1); // ✅ FIXED

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
    total
  });
});


app.get("/checkout/address/:productId", isLoggedIn, async (req, res) => {
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
    user: req.user
  });
});


app.post("/checkout/address/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { quantity, address, notes } = req.body;

  const qty = parseInt(quantity || 1);
  if (qty < 1) return res.redirect("/products");

  const product = await Products.findById(id);
  if (!product) return res.redirect("/products");

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
    total
  };

  res.redirect(`/checkout/review/${id}`);
});



// REVIEW PAGE
app.get("/checkout/review/:id", isLoggedIn, async (req, res) => {
  const checkout = req.session.checkout;

  if (!checkout || checkout.productId !== req.params.id) {
    return res.redirect("/products");
  }

  const product = await Products.findById(checkout.productId);
  if (!product) return res.redirect("/products");

  res.render("review", {
    product,
    qty: checkout.quantity,
    subtotal: checkout.subtotal,
    deliveryFee: checkout.deliveryFee,
    total: checkout.total,
    address: checkout.address,
    user: req.user
  });
});




// PLACE ORDER


app.post("/checkout/review/:id", isLoggedIn, async (req, res) => {
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
      items: [{
        product: product._id,
        productName: product.name,     // ✅ snapshot saved
        quantity: qty,
        priceAtOrder: product.pricePerQuintal
      }],
      totalAmount: total,
      status: "Pending",
      deliveryAddress: req.body.address,
      expectedDelivery: new Date(Date.now() + product.deliveryTime.maxDays * 86400000),
      timeline: [
        { status: "Placed" },
        { status: "Confirmed" }
      ]
    });

    product.available -= qty;

    await order.save();
    await product.save();

    // CREATE NOTIFICATION
    await Notification.create({
      user: req.user._id,
      order: order._id,
      product: product._id,
      type: "order",
      message: `Your order ${order.orderId} has been placed successfully.`,
      status: "unread"
    });

    res.redirect(`/order-success/${order.orderId}`);
  } catch (err) {
    console.error("PLACE ORDER ERROR:", err);
    res.redirect("/products");
  }
});


//Profile Route
app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await Users.findById(req.session.userId);
  res.render("profile", { user });
});

//Profile Edit Route
app.post("/profile/update", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;

    console.log("Updating user:", userId);
    console.log("Form data:", req.body);

    const updated = await Users.findByIdAndUpdate(
      userId,
      {
        fullName: req.body.fullName,
        phone: req.body.phone,
        business: req.body.business,
        businessType: req.body.businessType,
        gst: req.body.gst,
        defaultAddress: req.body.defaultAddress
      },
      { new: true, runValidators: true }
    );

    console.log("Updated user:", updated);

    res.redirect("/profile");
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.redirect("/profile");
  }
});

// browse products route
app.get("/browse-products", (req, res) => {
  res.render("browse-products.ejs");
});

// Show route
app.get("/products/:id",async(req,res)=>{
    let {id} = req.params;
    const product = await Products.findById(id);
    res.render("show.ejs",{product});
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})

