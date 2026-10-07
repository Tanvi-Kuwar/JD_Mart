const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, orderController.index);

router.get("/success/:id", isLoggedIn, orderController.success);

module.exports = router;