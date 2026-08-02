import { Link } from "react-router-dom";
import {
    Package,
    CreditCard,
    Truck,
    RotateCcw,
    User,
    Settings
} from "lucide-react";

const categories = [
    {
        title: "Order Issues",
        description: "Order not placed, wrong product, missing items and more.",
        icon: Package,
        color: "#2563eb",
        category: "Order Issue"
    },
    {
        title: "Payment Issues",
        description: "Payment deducted, refund pending, invoice requests.",
        icon: CreditCard,
        color: "#16a34a",
        category: "Payment Issue"
    },
    {
        title: "Delivery Issues",
        description: "Delayed delivery, tracking problems or package missing.",
        icon: Truck,
        color: "#ea580c",
        category: "Delivery Issue"
    },
    {
        title: "Return & Refund",
        description: "Return requests, pickup issues and refund tracking.",
        icon: RotateCcw,
        color: "#9333ea",
        category: "Return & Refund"
    },
    {
        title: "Account Issues",
        description: "Login problems, OTP issues and account settings.",
        icon: User,
        color: "#dc2626",
        category: "Account Issue"
    },
    {
        title: "Technical Support",
        description: "Website bugs, checkout issues and technical problems.",
        icon: Settings,
        color: "#0891b2",
        category: "Technical Issue"
    }
];

const CategoryGrid = () => {

    return (

        <section className="category-section">

            <div className="category-header">

                <h2>Browse Support Categories</h2>

                <p>
                    Select the category that best matches your issue.
                </p>

            </div>

            <div className="category-grid">

                {categories.map((item, index) => {

                    const Icon = item.icon;

                    return (

                        <Link
                            key={index}
                            to={`/help/create?category=${encodeURIComponent(item.category)}`}
                            className="category-card"
                        >

                            <div
                                className="category-icon"
                                style={{
                                    background: `${item.color}15`,
                                    color: item.color
                                }}
                            >
                                <Icon size={32} />
                            </div>

                            <h3>{item.title}</h3>

                            <p>{item.description}</p>

                            <span className="category-link">
                                Get Help →
                            </span>

                        </Link>

                    );

                })}

            </div>

        </section>

    );

};

export default CategoryGrid;