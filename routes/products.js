const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, productController.index);

router.get("/browse-products", productController.browseProducts);

router.get("/:id", productController.showProduct);

module.exports = router;