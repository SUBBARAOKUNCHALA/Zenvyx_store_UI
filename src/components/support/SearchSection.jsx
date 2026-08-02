import { useState } from "react";
import { Search } from "lucide-react";

const popularSearches = [
    "Payment Issue",
    "Track Order",
    "Return Product",
    "Refund Status",
    "Cancel Order",
    "Login Problem"
];

const SearchSection = () => {

    const [search, setSearch] = useState("");

    const handleSearch = () => {
        console.log("Search:", search);
        // Backend integration later
    };

    return (

        <section className="search-section">

            <div className="search-header">

                <h2>Search Help Articles</h2>

                <p>
                    Search your issue or choose one of the popular topics below.
                </p>

            </div>

            <div className="search-box">

                <Search
                    size={22}
                    className="search-icon"
                />

                <input
                    type="text"
                    placeholder="Search your issue..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                />

                <button
                    className="search-btn"
                    onClick={handleSearch}
                >
                    Search
                </button>

            </div>

            <div className="popular-searches">

                <span>Popular:</span>

                {popularSearches.map((item) => (

                    <button
                        key={item}
                        className="popular-chip"
                        onClick={() => setSearch(item)}
                    >
                        {item}
                    </button>

                ))}

            </div>

        </section>

    );
};

export default SearchSection;