import { Link } from "react-router-dom";
import {
    Headset,
    Ticket,
    ClipboardList,
    TicketPlus,
    PackageSearch,
    MessageCircleMore
} from "lucide-react";
import "./IssueTips.css"

const heroQuickLinks = [
    {
        title: "Raise a Ticket",
        icon: TicketPlus,
        link: "/help/create"
    },
    {
        title: "My Tickets",
        icon: ClipboardList,
        link: "/help/my-tickets"
    },
    {
        title: "Track My Orders",
        icon: PackageSearch,
        link: "/my-orders"
    },
    {
        title: "Live Chat",
        icon: MessageCircleMore,
        link: "#",
        disabled: true
    }
];

const HeroSection = () => {
    return (
        <section className="help-hero">

            <div className="help-hero-content">

                <div className="help-hero-left">

                    <span className="help-tag">
                        <Headset size={18} />
                        24/7 Customer Support
                    </span>

                    <h1>
                        How can we help you today?
                    </h1>

                    <p>
                        Get help with orders, payments, returns, delivery,
                        account issues, or raise a support ticket.
                        Our support team is here to assist you.
                    </p>

                    <div className="help-hero-buttons">

                        <Link
                            to="/help/create"
                            className="help-btn help-btn-primary"
                        >
                            <Ticket size={18} />
                            Raise Ticket
                        </Link>

                        <Link
                            to="/help/my-tickets"
                            className="help-btn help-btn-outline"
                        >
                            <ClipboardList size={18} />
                            My Tickets
                        </Link>

                    </div>

                </div>

                <div className="help-hero-right">

                    <div className="hero-quick-links">

                        <h3>Quick Links</h3>

                        <div className="hero-quick-list">

                            {heroQuickLinks.map((item, index) => {

                                const Icon = item.icon;

                                return item.disabled ? (

                                    <div
                                        key={index}
                                        className="hero-quick-item hero-quick-disabled"
                                    >
                                        <span className="hero-quick-icon">
                                            <Icon size={20} />
                                        </span>

                                        <span className="hero-quick-title">
                                            {item.title}
                                        </span>

                                        <span className="hero-quick-badge">
                                            Soon
                                        </span>
                                    </div>

                                ) : (

                                    <Link
                                        key={index}
                                        to={item.link}
                                        className="hero-quick-item"
                                    >
                                        <span className="hero-quick-icon">
                                            <Icon size={20} />
                                        </span>

                                        <span className="hero-quick-title">
                                            {item.title}
                                        </span>

                                        <span className="hero-quick-arrow">
                                            →
                                        </span>
                                    </Link>

                                );

                            })}

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
};

export default HeroSection;