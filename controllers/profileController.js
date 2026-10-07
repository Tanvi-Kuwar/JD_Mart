const Users = require("../models/user");

// ======================
// Profile Page
// ======================
module.exports.profile = async (req, res) => {
  try {
    const user = await Users.findById(req.session.userId);

    if (!user) {
      return res.redirect("/login");
    }

    res.render("profile", {
      user,
    });

  } catch (err) {
    console.log("PROFILE PAGE ERROR:", err);
    res.redirect("/products");
  }
};

// ======================
// Update Profile
// ======================
module.exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        fullName: req.body.fullName,
        phone: req.body.phone,
        business: req.body.business,
        businessType: req.body.businessType,
        gst: req.body.gst,
        defaultAddress: req.body.defaultAddress,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.redirect("/login");
    }

    // Update req.user so the latest data is available immediately
    req.user = updatedUser;

    res.redirect("/profile");

  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.redirect("/profile");
  }
};