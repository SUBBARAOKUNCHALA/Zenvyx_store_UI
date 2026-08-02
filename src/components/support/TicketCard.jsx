import { Link } from "react-router-dom";
import { CalendarDays, FolderOpen } from "lucide-react";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const TicketCard = ({ ticket }) => {

    return (

        <div className="ticket-card">

            <div className="ticket-card-top">

                <div>

                    <span className="ticket-id">

                        {ticket.ticketId}

                    </span>

                    <h2>

                        {ticket.subject}

                    </h2>

                </div>

                <StatusBadge status={ticket.status} />

            </div>

            <div className="ticket-meta">

                <div>

                    <FolderOpen size={18} />

                    <span>

                        {ticket.category}

                    </span>

                </div>

                <div>

                    <CalendarDays size={18} />

                    <span>

                        {new Date(ticket.createdAt).toLocaleDateString()}

                    </span>

                </div>

            </div>

            <div className="ticket-card-bottom">

                <PriorityBadge priority={ticket.priority} />

                <Link
                    to={`/help/ticket/${ticket._id}`}
                    className="ticket-view-btn"
                >

                    View Details →

                </Link>

            </div>

        </div>

    );

};

export default TicketCard;