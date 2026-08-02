import {
    Ticket,
    FolderOpen,
    CircleHelp,
    User,
    Mail,
    Package,
    CalendarDays,
    Clock3,
    ShieldCheck
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const TicketInfoSidebar = ({ ticket }) => {
    console.log('Order Information',ticket)

    return (

        <div className="ticket-sidebar">

            {/* Ticket Information */}

            <div className="sidebar-card">

                <h3>

                    Ticket Information

                </h3>

                <div className="sidebar-info">

                    <div>

                        <Ticket size={17} />

                        <span>Ticket ID</span>

                    </div>

                    <strong>


                        {ticket.ticketId}

                    </strong>

                </div>

                <div className="sidebar-info">

                    <div>

                        <FolderOpen size={17} />

                        <span>Category</span>

                    </div>

                    <strong>

                        {ticket.category}

                    </strong>

                </div>

                <div className="sidebar-info">

                    <div>

                        <CircleHelp size={17} />

                        <span>Issue Type</span>

                    </div>

                    <strong>

                        {ticket.issueType || "-"}

                    </strong>

                </div>

                <div className="sidebar-info">

                    <div>

                        <CalendarDays size={17} />

                        <span>Created</span>

                    </div>

                    <strong>

                        {/* {ticket.createdAt} */}
                        {new Date(
                                            ticket.createdAt
                                        ).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}

                    </strong>

                </div>

                <div className="sidebar-info">

                    <div>

                        <Clock3 size={17} />

                        <span>Updated</span>

                    </div>

                    <strong>

                        {/* {ticket.updatedAt || "-"} */}
                        {new Date(
                                            ticket.updatedAt
                                        ).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }) || "-"}

                    </strong>

                </div>

                <div className="sidebar-badges">

                    <StatusBadge
                        status={ticket.status}
                    />

                    <PriorityBadge
                        priority={ticket.priority}
                    />

                </div>

            </div>

            {/* Customer */}

            {/* <div className="sidebar-card">

                <h3>

                    Customer

                </h3>

                <div className="sidebar-info">

                    <div>

                        <User size={17} />

                        <span>Name</span>

                    </div>

                    <strong>

                        {ticket.customerName || "-"}

                    </strong>

                </div>

                <div className="sidebar-info">

                    <div>

                        <Mail size={17} />

                        <span>Email</span>

                    </div>

                    <strong>

                        {ticket.customerEmail || "-"}

                    </strong>

                </div>

            </div> */}

            {/* Order */}

            <div className="sidebar-card">

                <h3>

                    Order Information

                </h3>

                <div className="sidebar-info">

                    <div>

                        <Package size={17} />

                        <span>Order ID</span>

                    </div>

                    <strong>

                        {ticket.order.orderNumber || "N/A"}

                    </strong>

                </div>

                <div className="sidebar-info">

                    <div>

                        <ShieldCheck size={17} />

                        <span>Assigned To</span>

                    </div>

                    <strong>

                        {ticket.assignedTo || "Support Team"}

                    </strong>

                </div>

            </div>

        </div>

    );

};

export default TicketInfoSidebar;