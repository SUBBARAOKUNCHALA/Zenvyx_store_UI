import { Link } from "react-router-dom";
import { Headset, Ticket, ClipboardList } from "lucide-react";
import "./IssueTips.css"

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

                    <div className="support-card">

                        <div className="support-icon">
                            <Headset size={45} />
                        </div>

                        <h3>Customer Support</h3>

                        <p>
                            Fast responses from our support team for all
                            your shopping needs.
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
};

export default HeroSection;