import { Link } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    UserCircle2,
    Ticket
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const TicketHeader = ({ ticket }) => {

    return (

        <div className="ticket-header">

            <div className="ticket-header-top">

                <Link
                    to="/help/my-tickets"
                    className="back-btn"
                >

                    <ArrowLeft size={18} />

                    Back to My Tickets

                </Link>

            </div>

            <div className="ticket-header-content">

                <div className="ticket-left">

                    <div className="ticket-id-row">

                        <Ticket size={18} />

                        <span>

                            {ticket.ticketId}

                        </span>

                    </div>

                    <h1>

                        {ticket.subject}

                    </h1>

                    <div className="ticket-info-row">

                        <div>

                            <CalendarDays size={16} />

                            Created :

                            <strong>

                                {ticket.createdAt}

                            </strong>

                        </div>

                        <div>

                            <UserCircle2 size={16} />

                            Assigned :

                            <strong>

                                {ticket.assignedTo || "Not Assigned"}

                            </strong>

                        </div>

                    </div>

                </div>

                <div className="ticket-right">

                    <StatusBadge
                        status={ticket.status}
                    />

                    <PriorityBadge
                        priority={ticket.priority}
                    />

                </div>

            </div>

        </div>

    );

};

export default TicketHeader;