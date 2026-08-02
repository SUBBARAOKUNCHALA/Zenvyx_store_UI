import "./HelpCenter.css";

import HeroSection from "../components/support/HeroSection";
// import SearchSection from "../components/support/SearchSection";
import CategoryGrid from "../components/support/CategoryGrid";
import QuickActions from "../components/support/QuickActions";
import FAQPreview from "../components/support/FAQPreview";

import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";

const HelpCenter = () => {

    const navigate = useNavigate();

    return (

        <div className="help-center">

            <div className="help-center-container">

                {/* Top Buttons */}

                <div className="help-top-actions">

                    <button
                        className="help-back-btn"
                        onClick={() => navigate(-1)}
                    >

                        <ArrowLeft size={18} />

                        Back

                    </button>

                    <button
                        className="help-shopping-btn"
                        onClick={() => navigate("/")}
                    >

                        <ShoppingBag size={18} />

                        Continue Shopping

                    </button>

                </div>

                <HeroSection />

                {/* <SearchSection /> */}

                <CategoryGrid />

                <QuickActions />

                <FAQPreview />

            </div>

        </div>

    );

};

export default HelpCenter;