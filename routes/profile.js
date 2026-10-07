const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, profileController.profile);

router.post("/update", isLoggedIn, profileController.updateProfile);

module.exports = router;