import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Allproducts, toggleWishlistApi, removeWishlistApi } from "../services/authService";
import { Heart } from "lucide-react";
import "./Dashboard.css";

const footerLinks = {
  Shop: ["Shirts", "T-Shirts", "Pants", "New Arrivals", "Best Sellers"],
  Support: ["Contact Us", "Track Order", "Returns & Refunds", "Shipping Policy"],
  Company: ["About ZENVYX", "Privacy Policy", "Terms & Conditions", "Careers"],
};

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/zenvyx_store?igsh=Ym9qajYzamFjNHQ2",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/1LL3hmj2Eb/",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@zenvyx_store?si=v6oLp5IwFG1C9Rno",
  },
];

const navItems = [
  {
    label: "Shirts",
    key: "Shirt",
    sections: {
      "Top Wear": [
        "Formal Shirts",
        "Casual Shirts",
        "Printed Shirts",
        "Trending Shirts",
        "Party Wear",
      ],
    },
  },
  {
    label: "T-Shirts",
    key: "T-Shirt",
    sections: {
      Styles: ["Round Neck", "Polo T-Shirts", "Cotton T-Shirts"],
    },
  },
  {
    label: "Pants",
    key: "Pant",
    sections: {
      "Bottom Wear": ["Jeans", "Cargo Pants", "Formal Pants"],
    },
  },
  {
    label: "New Arrivals",
    key: "All",
    sections: {
      Latest: ["Fresh Styles", "Trending Now", "Premium Picks", "Season Drop"],
      Collections: ["Urban Wear", "Classic Wear", "Summer Wear", "Festive Wear"],
    },
  },
  {
    label: "Best Sellers",
    key: "All",
    sections: {
      "Most Loved": ["Top Rated", "Most Ordered", "Popular Picks", "Budget Picks"],
      Explore: ["Premium Clothing", "Everyday Essentials", "Combo Styles", "Top Deals"],
    },
  },
];

const allSizes = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"];

const normalizeText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");

const synonymMap = {
  shirt: ["shirt", "shirts", "formal shirt", "formal shirts", "casual shirt", "casual shirts"],
  tshirt: [
    "tshirt",
    "t shirts",
    "t shirt",
    "t-shirts",
    "tee",
    "tees",
    "round neck",
    "polo",
    "cotton t shirt",
    "cotton t shirts",
  ],
  pant: ["pant", "pants", "trouser", "trousers", "jeans", "cargo", "formal pants"],
  formal: ["formal", "office wear", "formal shirts", "formal pants"],
  casual: ["casual", "casual shirts", "daily wear"],
  roundneck: ["round neck", "roundneck"],
  jeans: ["jeans", "denim", "pants"],
  cargo: ["cargo", "cargo pants", "pants"],
};

const expandSearchTerms = (query = "") => {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const words = normalized.split(" ").filter(Boolean);
  const expanded = new Set([normalized, ...words]);

  words.forEach((word) => {
    if (synonymMap[word]) {
      synonymMap[word].forEach((item) => expanded.add(normalizeText(item)));
    }
  });

  if (normalized.includes("formal shirt")) {
    expanded.add("shirt");
    expanded.add("formal");
    expanded.add("formal shirts");
  }

  if (
    normalized.includes("t shirt") ||
    normalized.includes("tshirt") ||
    normalized.includes("tee") ||
    normalized.includes("round neck") ||
    normalized.includes("polo")
  ) {
    expanded.add("tshirt");
    expanded.add("round neck");
    expanded.add("polo");
    expanded.add("cotton t shirts");
  }

  if (
    normalized.includes("pant") ||
    normalized.includes("pants") ||
    normalized.includes("trouser") ||
    normalized.includes("trousers") ||
    normalized.includes("jeans") ||
    normalized.includes("cargo")
  ) {
    expanded.add("pant");
    expanded.add("pants");
    expanded.add("jeans");
    expanded.add("cargo pants");
    expanded.add("formal pants");
  }

  return [...expanded];
};

const buildSearchBlob = (item) =>
  normalizeText(
    [
      item?.name,
      item?.description,
      item?.category,
      item?.subCategory,
      ...(item?.sizes || []),
      ...(item?.tags || []),
    ].join(" ")
  );

const isTShirtProduct = (item) => {
  const category = normalizeText(item?.category);
  const subCategory = normalizeText(item?.subCategory);
  const name = normalizeText(item?.name);

  return (
    category.includes("t shirt") ||
    category.includes("tshirt") ||
    category.includes("round neck") ||
    category.includes("polo") ||
    subCategory.includes("t shirt") ||
    subCategory.includes("tshirt") ||
    subCategory.includes("round neck") ||
    subCategory.includes("polo") ||
    name.includes("t shirt") ||
    name.includes("tshirt") ||
    name.includes("round neck") ||
    name.includes("polo")
  );
};

const matchesSelectedCategory = (item, selectedCategory) => {
  if (selectedCategory === "All") return true;

  const category = normalizeText(item?.category);
  const subCategory = normalizeText(item?.subCategory);
  const name = normalizeText(item?.name);

  if (selectedCategory === "Shirt") {
    return category.includes("shirt") && !isTShirtProduct(item);
  }

  if (selectedCategory === "T-Shirt") {
    return isTShirtProduct(item);
  }

  if (selectedCategory === "Pant") {
    return (
      category.includes("pant") ||
      category.includes("pants") ||
      category.includes("jeans") ||
      category.includes("cargo") ||
      subCategory.includes("pant") ||
      subCategory.includes("pants") ||
      subCategory.includes("jeans") ||
      subCategory.includes("cargo") ||
      name.includes("pant") ||
      name.includes("pants") ||
      name.includes("jeans") ||
      name.includes("cargo")
    );
  }

  return false;
};


const getLetterSizes = (sizes = []) => {
  return sizes.filter((size) => isNaN(Number(size)));
};

const getNumberSizes = (sizes = []) => {
  return sizes.filter((size) => !isNaN(Number(size)));
};

const Dashboard = () => {
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [showInchSizes, setShowInchSizes] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNav, setHoveredNav] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [likedProducts, setLikedProducts] = useState({});

  const toggleWishlist = async (productId) => {
    try {
      const res = await toggleWishlistApi(productId);

      if (res.data.success) {
        setLikedProducts((prev) => ({
          ...prev,
          [productId]: res.data.liked,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await Allproducts();
        const rawProducts = res?.data?.data || [];

        const enrichedProducts = rawProducts.map((item) => ({
          ...item,
          _searchBlob: buildSearchBlob(item),
        }));

        setProducts(enrichedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromUrl = params.get("search") || "";
    setSearch(searchFromUrl);
  }, [location.search]);

  const chooseCategory = (category) => {
    setSelectedCategory(category);
    setHoveredNav(null);

    const params = new URLSearchParams(location.search);
    params.delete("search");
    setSearch("");

    navigate({
      pathname: "/",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const handleSubCategoryClick = (parentCategory, subCategory) => {
    setSelectedCategory(parentCategory);
    setSearch(subCategory);

    const params = new URLSearchParams(location.search);
    params.set("search", subCategory);

    navigate({
      pathname: "/",
      search: `?${params.toString()}`,
    });

    setHoveredNav(null);
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedSizes([]);
    setSearch("");
    setSortBy("newest");
    navigate("/");
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`, {
      state: { product },
    });
  };

  const categoryCards = useMemo(() => {
    const shirt = products.find((p) => matchesSelectedCategory(p, "Shirt"));
    const tshirt = products.find((p) => matchesSelectedCategory(p, "T-Shirt"));
    const pant = products.find((p) => matchesSelectedCategory(p, "Pant"));

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
      data = data.filter((item) => matchesSelectedCategory(item, selectedCategory));
    }

    if (search.trim()) {
      const searchTerms = expandSearchTerms(search);

      data = data.filter((item) => {
        const blob = item._searchBlob || buildSearchBlob(item);
        return searchTerms.some((term) => blob.includes(term));
      });
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
              className={`subNavItem ${selectedCategory === item.key ||
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
                    <p
                      key={sub}
                      onClick={() => handleSubCategoryClick(hoveredNav.key, sub)}
                    >
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
            <button className="secondaryBtn" onClick={() => chooseCategory("All")}>
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
            onClick={() => chooseCategory(item.value)}
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
            {/* <p>{filteredProducts.length} products found</p> */}
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

          {/* <select
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
          </select> */}

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

            {/* <div className="filterBlock">
              <h4>Sizes</h4>
              <div className="sizeWrap">
                {allSizes
                  .filter((size) => size !== "")
                  .map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`sizeChip ${selectedSizes.includes(size) ? "activeSize" : ""
                        }`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
              </div>
            </div> */}

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
                    {/* <div className="productImageBox">
                      <img src={product.image} alt={product.name} />
                      <span className="productTag">
                        {product.subCategory || product.category}
                      </span>
                    </div> */}
                    <div
                      className="productImageBox"
                      onMouseEnter={() => setHoveredProductId(product._id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      {(() => {
                        const productImages = [
                          product.image,
                          ...(product.images || []),
                        ].filter(Boolean);

                        return (
                          <>
                            {productImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={img}
                                alt={product.name}
                                className={`slideImage ${hoveredProductId === product._id ? "playSlide" : ""
                                  }`}
                                style={{
                                  animationDelay: `${imgIndex * 1.4}s`,
                                }}
                              />
                            ))}

                            <div className="slideDots">
                              {productImages.map((_, dotIndex) => (
                                <span
                                  key={dotIndex}
                                  style={{
                                    animationDelay: `${dotIndex * 2}s`,
                                  }}
                                ></span>
                              ))}
                            </div>
                          </>
                        );
                      })()}

                      <span className="productTag">
                        {product.subCategory || product.category}
                      </span>

                      <button
                        className={`wishlistBtn ${likedProducts[product._id] ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(`/product/${product._id}`, {
                            state: {
                              product,
                              openWishlist: true,
                            },
                          });
                        }}
                      >
                        <Heart size={28} />
                      </button>
                    </div>

                    <div className="productContent">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>

                      {/* <div className="priceRow">
                        <span className="price">₹{product.price}.00</span>
                        <span className="stockText">
                          {product.stock > 0
                            ? `${product.stock} left`
                            : "Out of stock"}
                        </span>
                      </div> */}

                      {(() => {
                        const price = Number(product.price) || 0;
                        const discountPercent = Number(product.discount) || 0;
                        const finalPrice =
                          discountPercent > 0 ? price - (price * discountPercent) / 100 : price;

                        return (
                          <div className="priceRowSingle">
                            <span className="price">₹{Math.round(finalPrice)}.00</span>

                            {discountPercent > 0 && (
                              <span className="oldPrice">₹{price.toFixed(2)}</span>
                            )}
                            {discountPercent > 0 && (
                              <span className="discountText">
                                ({discountPercent}% OFF)
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* <div className="sizesRow">
                        {product.sizes?.map((size) => (
                          <span key={size} className="productSize">
                            {size}
                          </span>
                        ))}
                      </div> */}
                      {/* <div className="sizesRow">
                        {(showInchSizes[product._id]
                          ? getNumberSizes(product.sizes)
                          : getLetterSizes(product.sizes)
                        ).map((size) => (
                          <span key={size} className="productSize">
                            {size}
                          </span>
                        ))}
                      </div>

                      {getNumberSizes(product.sizes).length > 0 && (
                        <div
                          className="inchSizeBox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="inchCheckLabel">
                            <input
                              type="checkbox"
                              checked={!!showInchSizes[product._id]}
                              onChange={(e) =>
                                setShowInchSizes((prev) => ({
                                  ...prev,
                                  [product._id]: e.target.checked,
                                }))
                              }
                            />
                            In Inches
                          </label>
                        </div>
                      )} */}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="dashboardFooter">
        <div className="footerTop">
          <div className="footerBrand">
            <h2>ZENVYX</h2>
            <p>We Create Attitude</p>
            <span>
              Premium fashion for everyday confidence. Built with comfort, trend, and
              quality.
            </span>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div className="footerColumn" key={title}>
              <h4>{title}</h4>

              {links.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => {
                    // ✅ Terms navigation
                    if (link === "Terms & Conditions") {
                      navigate("/terms");
                      return;
                    }
                    else if (link === "Track Order") {
                      navigate("/my-orders");
                      return;
                    }

                    // ✅ Category navigation
                    if (["Shirts", "T-Shirts", "Pants"].includes(link)) {
                      chooseCategory(
                        link === "Shirts"
                          ? "Shirt"
                          : link === "T-Shirts"
                            ? "T-Shirt"
                            : "Pant"
                      );

                      document
                        .getElementById("productsSection")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {link}
                </button>
              ))}
            </div>
          ))}

          <div className="footerColumn">
            <h4>Follow Us</h4>

            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="socialBtn"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="footerPolicyBox">
          <div>
            <h4
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/terms")}
            >
              Terms & Conditions
            </h4>
            <p>
              By using ZENVYX, customers agree to provide accurate order, address, and
              contact information. Product colors may slightly vary due to screen
              settings. Orders are subject to stock availability and verification.
            </p>
          </div>

          <div>
            <h4>Privacy & Payments</h4>
            <p>
              Customer data is used only for order processing, delivery, support, and
              account security. Online payments are processed through secure payment
              gateway partners.
            </p>
          </div>

          <div>
            <h4>Returns & Refunds</h4>
            <p>
              Eligible products can be returned within the allowed return window if
              unused, undamaged, and with original packaging. Refund timelines depend
              on the selected payment method.
            </p>
          </div>
        </div>

        <div className="footerBottom">
          <p>© {new Date().getFullYear()} ZENVYX. All rights reserved.</p>
          <p>Secure Shopping • Easy Returns • Trusted Delivery</p>
        </div>
      </footer>
    </div>

  );
};

export default Dashboard;