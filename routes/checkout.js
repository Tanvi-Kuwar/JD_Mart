const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkoutController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/:id", isLoggedIn, checkoutController.checkout);

router.get("/address/:productId", isLoggedIn, checkoutController.addressPage);

router.post("/address/:id", isLoggedIn, checkoutController.saveAddress);

router.get("/review/:id", isLoggedIn, checkoutController.reviewPage);

router.post("/review/:id", isLoggedIn, checkoutController.placeOrder);

module.exports = router;