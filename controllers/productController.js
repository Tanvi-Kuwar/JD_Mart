const Products = require("../models/product");
const getDashboardStats = require("../models/dashboardStat");

// ======================
// Products Page
// ======================
module.exports.index = async (req, res) => {
  try {
    const allProducts = await Products.find({})
      .sort({ time: -1 });

    const dashboardStats = await getDashboardStats();

    res.render("index.ejs", {
      allProducts,
      dashboardStats,
    });

  } catch (err) {
    console.log("Error fetching products:", err);
    res.send("Something went wrong");
  }
};

// ======================
// Browse Products Page
// ======================
module.exports.browseProducts = (req, res) => {
  res.render("browse-products.ejs");
};

// ======================
// Product Details Page
// ======================
module.exports.showProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findById(id);

    if (!product) {
      return res.redirect("/products");
    }

    res.render("show.ejs", {
      product,
    });

  } catch (err) {
    console.log("SHOW PRODUCT ERROR:", err);
    res.redirect("/products");
  }
};