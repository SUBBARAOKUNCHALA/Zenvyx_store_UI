import { Link } from "react-router-dom";
import {
    TicketPlus,
    ClipboardList,
    PackageSearch,
    MessageCircleMore
} from "lucide-react";

const actions = [
    {
        title: "Raise a Ticket",
        description: "Create a new support request for any issue.",
        icon: TicketPlus,
        link: "/help/create"
    },
    {
        title: "My Tickets",
        description: "View all your existing support tickets.",
        icon: ClipboardList,
        link: "/help/my-tickets"
    },
    {
        title: "Track My Orders",
        description: "Check delivery status and tracking updates.",
        icon: PackageSearch,
        link: "/my-orders"
    },
    {
        title: "Live Chat",
        description: "Chat with our support team (Coming Soon).",
        icon: MessageCircleMore,
        link: "#",
        disabled: true
    }
];

const QuickActions = () => {

    return (

        <section className="quick-actions-section">

            <div className="quick-header">

                <h2>Quick Actions</h2>

                <p>
                    Need something fast? Choose one of the options below.
                </p>

            </div>

            <div className="quick-grid">

                {actions.map((item, index) => {

                    const Icon = item.icon;

                    return item.disabled ? (

                        <div
                            key={index}
                            className="quick-card disabled-card"
                        >

                            <div className="quick-icon">
                                <Icon size={30} />
                            </div>

                            <h3>{item.title}</h3>

                            <p>{item.description}</p>

                            <span className="coming-soon">
                                Coming Soon
                            </span>

                        </div>

                    ) : (

                        <Link
                            key={index}
                            to={item.link}
                            className="quick-card"
                        >

                            <div className="quick-icon">
                                <Icon size={30} />
                            </div>

                            <h3>{item.title}</h3>

                            <p>{item.description}</p>

                            <span className="quick-link">
                                Open →
                            </span>

                        </Link>

                    );

                })}

            </div>

        </section>

    );

};

export default QuickActions;