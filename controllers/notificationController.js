const Notification = require("../models/notification");

// ======================
// Notifications Page
// ======================
module.exports.index = async (req, res) => {
  try {
    // Fetch all notifications (latest first)
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    // Mark unread notifications as read
    await Notification.updateMany(
      {
        user: req.user._id,
        status: "unread",
      },
      {
        status: "read",
      }
    );

    res.render("notifications", {
      notifications,
      user: req.user,
    });

  } catch (err) {
    console.log("NOTIFICATION ERROR:", err);
    res.redirect("/products");
  }
};