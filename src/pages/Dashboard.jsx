import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Allproducts } from "../services/authService";
import "./Dashboard.css";

const navItems = [
  {
    label: "Shirts",
    key: "Shirt",
    sections: {
      "Top Wear": ["Formal Shirts", "Casual Shirts", "Printed Shirts", "Slim Fit Shirts"],
      "Popular": ["New Arrivals", "Trending Shirts", "Office Wear", "Party Wear"],
    },
  },
  {
    label: "T-Shirts",
    key: "T-Shirt",
    sections: {
      "Styles": ["Round Neck", "Oversized", "Graphic", "Polo T-Shirts"],
      "Popular": ["Cotton Tees", "Printed Tees", "Plain Tees", "Streetwear"],
    },
  },
  {
    label: "Pants",
    key: "Pant",
    sections: {
      "Bottom Wear": ["Chinos", "Jeans", "Cargo Pants", "Formal Pants"],
      "Popular": ["Slim Fit", "Regular Fit", "Stretchable", "Daily Wear"],
    },
  },
  {
    label: "New Arrivals",
    key: "All",
    sections: {
      "Latest": ["Fresh Styles", "Trending Now", "Premium Picks", "Season Drop"],
      "Collections": ["Urban Wear", "Classic Wear", "Summer Wear", "Festive Wear"],
    },
  },
  {
    label: "Best Sellers",
    key: "All",
    sections: {
      "Most Loved": ["Top Rated", "Most Ordered", "Popular Picks", "Budget Picks"],
      "Explore": ["Premium Clothing", "Everyday Essentials", "Combo Styles", "Top Deals"],
    },
  },
];

const allSizes = ["", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNav, setHoveredNav] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await Allproducts();
        setProducts(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

const categoryCards = useMemo(() => {
  const shirt = products.find((p) => p.category === "Shirt");
  const tshirt = products.find((p) => p.category === "T-Shirt");
  const pant = products.find((p) => p.category === "Pant");

  const fallbackImage =
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";

  return [
    {
      label: "Shirts",
      value: "Shirt",
      image: shirt?.image || fallbackImage,
    },
    {
      label: "T-Shirts",
      value: "T-Shirt",
      image: tshirt?.image || fallbackImage,
    },
    {
      label: "Pants",
      value: "Pant",
      image: pant?.image || fallbackImage,
    },
    {
      label: "Trending",
      value: "All",
      image: products[0]?.image || fallbackImage,
    },
    {
      label: "New",
      value: "All",
      image: products[1]?.image || products[0]?.image || fallbackImage,
    },
    {
      label: "Best",
      value: "All",
      image: products[2]?.image || products[0]?.image || fallbackImage,
    },
  ];
}, [products]);

  const filteredProducts = useMemo(() => {
    let data = [...products];

    if (selectedCategory !== "All") {
      data = data.filter((item) => item.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term)
      );
    }

    if (selectedSizes.length > 0) {
      data = data.filter((item) =>
        item.sizes?.some((size) => selectedSizes.includes(size))
      );
    }

    if (sortBy === "priceLowToHigh") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighToLow") {
      data.sort((a, b) => b.price - a.price);
    } else if (sortBy === "nameAZ") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return data;
  }, [products, selectedCategory, selectedSizes, search, sortBy]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const chooseCategory = (category) => {
    setSelectedCategory(category);
    setHoveredNav(null);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedSizes([]);
    setSearch("");
    setSortBy("newest");
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`, {
      state: { product },
    });
  };

  return (
    <div className="dashboardPage">
      <div className="subNavWrapper" onMouseLeave={() => setHoveredNav(null)}>
        <motion.div
          className="subNavScroll"
          initial={{ opacity: 0, y: -18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              className={`subNavItem ${
                selectedCategory === item.key ||
                (item.key === "All" && selectedCategory === "All")
                  ? "activeSubNav"
                  : ""
              }`}
              onMouseEnter={() => setHoveredNav(item)}
              onClick={() => chooseCategory(item.key)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              whileHover={{ y: -2 }}
            >
              {item.label}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence>
          {hoveredNav && (
            <motion.div
              className="megaMenu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              {Object.entries(hoveredNav.sections).map(([title, items]) => (
                <div className="megaColumn" key={title}>
                  <h4>{title}</h4>
                  {items.map((sub) => (
                    <p key={sub} onClick={() => chooseCategory(hoveredNav.key)}>
                      {sub}
                    </p>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="heroSection">
        <div className="heroLeft">
          <div className="heroBadge">NEW SEASON DROP</div>
          <h1>Style That Speaks Before You Do</h1>
          <p>
            Discover premium shirts, t-shirts, and pants crafted for comfort,
            trend, and confidence. Your wardrobe upgrade starts here.
          </p>

          <div className="heroButtons">
            <button
              className="primaryBtn"
              onClick={() =>
                document
                  .getElementById("productsSection")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Shop Now
            </button>
            <button
              className="secondaryBtn"
              onClick={() => setSelectedCategory("All")}
            >
              Explore Collection
            </button>
          </div>

          <div className="heroFeatures">
            <span>7 Days Easy Return</span>
            <span>Cash on Delivery</span>
            <span>Premium Quality</span>
          </div>
        </div>

        <div className="heroRight">
          <div className="heroCard heroCardOne">
            <img
              src={
                products[0]?.image ||
                "https://via.placeholder.com/700x900?text=Fashion"
              }
              alt="fashion"
            />
          </div>
          <div className="heroCard heroCardTwo">
            <img
              src={
                products[1]?.image ||
                products[0]?.image ||
                "https://via.placeholder.com/700x900?text=Style"
              }
              alt="style"
            />
          </div>
        </div>
      </section>

      <section className="categorySection">
        {categoryCards.map((item, index) => (
          <motion.div
            key={item.label}
            className="categoryCard"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedCategory(item.value)}
          >
            <div className="categoryImageWrap">
              <img src={item.image} alt={item.label} />
            </div>
            <p>{item.label}</p>
          </motion.div>
        ))}
      </section>

      <section className="productsSection" id="productsSection">
        <div className="productsTopBar">
          <div>
            <h2>Products For You</h2>
            <p>{filteredProducts.length} products found</p>
          </div>

          <select
            className="sortSelect desktopSort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="nameAZ">Name: A to Z</option>
          </select>
        </div>

        <div className="mobileFilterBar">
          <select
            className="mobileFilterSelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Shirt">Shirts</option>
            <option value="T-Shirt">T-Shirts</option>
            <option value="Pant">Pants</option>
          </select>

          <select
            className="mobileFilterSelect"
            value={selectedSizes[0] || ""}
            onChange={(e) =>
              setSelectedSizes(e.target.value ? [e.target.value] : [])
            }
          >
            <option value="">All Sizes</option>
            {allSizes
              .filter((size) => size !== "")
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>

          <select
            className="mobileFilterSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="priceLowToHigh">Low to High</option>
            <option value="priceHighToLow">High to Low</option>
            <option value="nameAZ">A to Z</option>
          </select>

          <button className="mobileClearBtn" onClick={clearAllFilters}>
            Clear
          </button>
        </div>

        <div className="productLayout">
          <aside className="filterSidebar">
            <div className="filterCard">
              <h3>Filters</h3>
              <p className="subText">Refine your clothing collection</p>
            </div>

            <div className="filterBlock">
              <h4>Search</h4>
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filterSearch"
              />
            </div>

            <div className="filterBlock">
              <h4>Category</h4>
              <label className="checkRow">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "All"}
                  onChange={() => setSelectedCategory("All")}
                />
                <span>All</span>
              </label>
              <label className="checkRow">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "Shirt"}
                  onChange={() => setSelectedCategory("Shirt")}
                />
                <span>Shirts</span>
              </label>
              <label className="checkRow">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "T-Shirt"}
                  onChange={() => setSelectedCategory("T-Shirt")}
                />
                <span>T-Shirts</span>
              </label>
              <label className="checkRow">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "Pant"}
                  onChange={() => setSelectedCategory("Pant")}
                />
                <span>Pants</span>
              </label>
            </div>

            <div className="filterBlock">
              <h4>Sizes</h4>
              <div className="sizeWrap">
                {allSizes
                  .filter((size) => size !== "")
                  .map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`sizeChip ${
                        selectedSizes.includes(size) ? "activeSize" : ""
                      }`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
              </div>
            </div>

            <button className="clearBtn" onClick={clearAllFilters}>
              Clear Filters
            </button>
          </aside>

          <div className="productGridWrap">
            {loading ? (
              <div className="emptyState">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="emptyState">No products found.</div>
            ) : (
              <div className="productGrid">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    className="productCard"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="productImageBox">
                      <img src={product.image} alt={product.name} />
                      <span className="productTag">{product.category}</span>
                    </div>

                    <div className="productContent">
                      <h3>{product.name}</h3>
                      {/* <p>{product.description}</p> */}

                      <div className="priceRow">
                        <span className="price">₹{product.price}.00</span>
                        <span className="stockText">
                          {product.stock > 0
                            ? `${product.stock} left`
                            : "Out of stock"}
                        </span>
                      </div>

                      <div className="sizesRow">
                        {product.sizes?.map((size) => (
                          <span key={size} className="productSize">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;