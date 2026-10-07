require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const Users = require("./models/user");
const Notification = require("./models/notification");

const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;

// ======================
// Route Imports
// ======================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const checkoutRoutes = require("./routes/checkout");
const orderRoutes = require("./routes/orders");
const profileRoutes = require("./routes/profile");
const notificationRoutes = require("./routes/notifications");

// ======================
// MongoDB
// ======================
// const MONGO_URL = "mongodb://127.0.0.1:27017/jdmart";
const MONGO_URL = process.env.MONGO_URL;

// ======================
// View Engine
// ======================
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================
// Middleware
// ======================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ======================
// Session
// ======================
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ======================
// Current Logged In User
// ======================
app.use(async (req, res, next) => {
  res.locals.user = null;

  if (req.session.userId) {
    req.user = await Users.findById(req.session.userId);
    res.locals.user = req.user;
  }

  next();
});

// ======================
// Notifications Middleware
// ======================
app.use(async (req, res, next) => {
  if (!req.user) {
    res.locals.notifications = [];
    res.locals.unreadCount = 0;
    return next();
  }

  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      status: "unread",
    });

    res.locals.notifications = notifications;
    res.locals.unreadCount = unreadCount;
  } catch (err) {
    console.log(err);
    res.locals.notifications = [];
    res.locals.unreadCount = 0;
  }

  next();
});

// ======================
// Database Connection
// ======================
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// ======================
// Routes
// ======================
app.use("/", authRoutes);

app.use("/products", productRoutes);

app.use("/checkout", checkoutRoutes);

app.use("/orders", orderRoutes);

app.use("/profile", profileRoutes);

app.use("/notifications", notificationRoutes);

// ======================
// 404
// ======================
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ======================
// Server
// ======================
const PORT=process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});