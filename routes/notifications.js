const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, notificationController.index);

module.exports = router;