import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

const EmptyTickets = () => {

    return (

        <div className="empty-tickets">

            <div className="empty-icon">

                <Inbox size={70} />

            </div>

            <h2>

                No Support Tickets Found

            </h2>

            <p>

                You haven't created any support tickets yet.
                If you need help with an order, payment,
                delivery, refund, or any other issue,
                create your first ticket.

            </p>

            <Link
                to="/help/create"
                className="raise-ticket-link"
            >

                Raise a Support Ticket

            </Link>

        </div>

    );

};

export default EmptyTickets;