(() => {
  "use strict";

  // ================= DOM CACHE =================
  const dropdown = document.getElementById("userDropdown");
  const locationText = document.getElementById("locationText");
  const searchInput = document.getElementById("productSearch");
  const productRow= document.querySelector(".product-container .row"); // container of product cards
  const productLinks = Array.from(document.querySelectorAll(".product-link"));
  const defaultAddress = document.getElementById("defaultAddress");

  // Category Buttons
  const categoryButtons = document.querySelectorAll(".cat-btn");

  // Sort Dropdown
  const sortDropdown = document.getElementById("sortDropdown");
  const sortItems = document.querySelectorAll("#sortDropdown + .dropdown-menu .dropdown-item");
  let currentSort = "low"; // default Low → High
  let currentCategory = "all"; // default all categories

  // grid and list buttons
  const gridBtn = document.getElementById("gridView");
  const listBtn = document.getElementById("listView");
  
  // ================= USER DROPDOWN =================
  if (dropdown) {
    document.addEventListener("click", (e) => {
      dropdown.classList.toggle("active", dropdown.contains(e.target));
    });
  }

  // ================= GEO LOCATION =================
  async function getLocationAndSave() {
    if (!navigator.geolocation || !locationText) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const addr = data.address || {};
        const area = addr.suburb || addr.village || "";
        const city = addr.city || addr.town || addr.state || "";
        const country = addr.country || "";
        const fullAddress = `${area ? area + ", " : ""}${city}, ${country}`;

        locationText.textContent = fullAddress;

        if (defaultAddress) defaultAddress.value = fullAddress;
      } catch (err) {
        console.error("Location error:", err);
        locationText.textContent = "Location unavailable";
      }
    });
  }

  // ================= SEARCH FILTER =================
  function filterProducts() {
    const query = searchInput?.value.toLowerCase() || "";

    productLinks.forEach((link) => {
      const name = link.querySelector(".jd-product-name")?.innerText.toLowerCase() || "";
      const category = link.querySelector(".jd-category")?.innerText.toLowerCase() || "";
      const description = link.dataset.description?.toLowerCase() || "";

      const matchSearch =
        name.includes(query) || category.includes(query) || description.includes(query);

      const matchCategory =
        currentCategory === "all" || link.dataset.category === currentCategory;

      link.style.display = matchSearch && matchCategory ? "block" : "none";
    });

    sortProducts(); // re-sort after filtering
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  // ================= CATEGORY FILTER =================
  if (categoryButtons.length) {
    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        currentCategory = btn.dataset.category;
        filterProducts();
      });
    });
  }

  // ================= PRICE & NAME SORT =================
function getPrice(el) {
  return Number(el.querySelector(".jd-current").textContent.replace(/[^0-9]/g, ""));
}

function getName(el) {
  return el.querySelector(".jd-product-name").textContent.toLowerCase();
}

function sortProducts() {
  const visibleProducts = productLinks.filter((p) => p.style.display !== "none");

  visibleProducts.sort((a, b) => {
    if (currentSort === "low") {
      return getPrice(a) - getPrice(b);
    } else if (currentSort === "high") {
      return getPrice(b) - getPrice(a);
    } else if (currentSort === "a-z") {
      return getName(a).localeCompare(getName(b));
    } else if (currentSort === "z-a") {
      return getName(b).localeCompare(getName(a));
    }
  });

  visibleProducts.forEach((p) => productRow.appendChild(p));
}

// ================= SORT EVENT =================
if (sortItems.length) {
  sortItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      currentSort = item.dataset.sort;
      sortDropdown.textContent = item.textContent;
      sortProducts();
    });
  });
}

 // ================= GRID / LIST VIEW =================
  if (gridBtn && listBtn) {
    gridBtn.addEventListener("click", () => {
      productRow.classList.remove("list-view");
      productRow.classList.add("row-cols-lg-4", "row-cols-md-3", "row-cols-sm-1");
    });

    listBtn.addEventListener("click", () => {
      productRow.classList.add("list-view");
      productRow.classList.remove("row-cols-lg-4", "row-cols-md-3", "row-cols-sm-1");
    });
  }

  // ================= INIT =================
  getLocationAndSave();
})();
