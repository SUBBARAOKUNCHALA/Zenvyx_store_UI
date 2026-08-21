import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    User,
    Mail,
    Package,
    Send,
    Trash2
} from "lucide-react";

import {
    getAdminTicketApi,
    adminReplyTicketApi,
    updateTicketStatusApi,
    deleteSupportTicketApi
} from "../../../services/adminSupportService";

import "./AdminTicketDetails.css";

const STATUS_OPTIONS = [
    "Open",
    "Pending",
    "Waiting for Customer",
    "In Progress",
    "Resolved",
    "Closed",
];

const AdminTicketDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(true);

    const [notFound, setNotFound] = useState(false);

    const [reply, setReply] = useState("");

    const [replyLoading, setReplyLoading] = useState(false);

    const [statusLoading, setStatusLoading] = useState(false);


    const fetchTicket = async () => {

        try {

            setLoading(true);

            const res = await getAdminTicketApi(id);

            const data = res?.data?.data;

            if (!data?.ticket) {
                setNotFound(true);
            } else {
                setTicket(data.ticket);
                setMessages(data.messages || []);
            }

        } catch (error) {

            console.error("Admin Ticket Error:", error);
            setNotFound(true);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchTicket();

    }, [id]);


    const handleReply = async (e) => {

        e.preventDefault();

        if (!reply.trim()) {

            alert("Please enter a reply.");

            return;

        }

        try {

            setReplyLoading(true);

            await adminReplyTicketApi(
                id,
                {
                    message: reply.trim()
                }
            );

            setReply("");

            // Reply changes both the message thread and the ticket status
            // ("Waiting for Customer"), so a full refetch is needed here.
            await fetchTicket();

        } catch (error) {

            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Failed to send reply."
            );

        } finally {

            setReplyLoading(false);

        }

    };


    const handleStatusChange = async (newStatus) => {

        const previousStatus = ticket.status;

        // Optimistic update — no need to refetch the whole ticket + thread
        // just to change one field.
        setTicket(prev => ({
            ...prev,
            status: newStatus
        }));

        try {

            setStatusLoading(true);

            await updateTicketStatusApi(id, newStatus);

        } catch (error) {

            console.error(error);

            // Roll back on failure
            setTicket(prev => ({
                ...prev,
                status: previousStatus
            }));

            alert(
                error?.response?.data?.message ||
                "Failed to update status."
            );

        } finally {

            setStatusLoading(false);

        }

    };


    const handleDelete = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this ticket?"
        );

        if (!confirmed) return;

        try {

            await deleteSupportTicketApi(id);

            alert("Ticket deleted successfully.");

            navigate("/~fiadmin/support/tickets");

        } catch (error) {

            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Failed to delete ticket."
            );

        }

    };


    if (loading) {

        return (

            <div className="admin-ticket-loading">
                Loading ticket...
            </div>

        );

    }


    if (notFound || !ticket) {

        return (

            <div className="admin-ticket-not-found">

                <h2>
                    Ticket Not Found
                </h2>

                <button
                    onClick={() =>
                        navigate("/~fiadmin/support/tickets")
                    }
                >
                    Back to Tickets
                </button>

            </div>

        );

    }


    return (

        <div className="admin-ticket-details">

            <div className="admin-ticket-container">

                {/* Header */}

                <div className="admin-ticket-top">

                    <button
                        className="admin-back-btn"
                        onClick={() =>
                            navigate("/~fiadmin/support/tickets")
                        }
                    >

                        <ArrowLeft size={18} />

                        Back to Tickets

                    </button>


                    <button
                        className="admin-delete-btn"
                        onClick={handleDelete}
                    >

                        <Trash2 size={17} />

                        Delete Ticket

                    </button>

                </div>


                {/* Ticket header card */}

                <div className="admin-ticket-header-card">

                    <div>

                        <span className="admin-ticket-id">
                            {ticket.ticketId}
                        </span>

                        <h1>
                            {ticket.subject}
                        </h1>

                        <p>
                            {ticket.category}
                            {" • "}
                            {ticket.issueType}
                        </p>

                    </div>


                    <div className="admin-ticket-status-control">

                        <label>
                            Status
                        </label>

                        <select
                            value={ticket.status}
                            disabled={statusLoading}
                            onChange={(e) =>
                                handleStatusChange(e.target.value)
                            }
                        >

                            {
                                STATUS_OPTIONS.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                </div>


                <div className="admin-ticket-grid">


                    {/* Main */}

                    <div>

                        <div className="admin-conversation-card">

                            <div className="admin-card-heading">

                                <div>

                                    <h2>
                                        Conversation
                                    </h2>

                                    <p>
                                        Customer and support communication
                                    </p>

                                </div>

                            </div>


                            <div className="admin-message-list">

                                {

                                    messages.length === 0 ?

                                        <div className="admin-no-messages">
                                            No messages available.
                                        </div>

                                        :

                                        messages.map(message => {

                                            const customer =
                                                message.senderType?.toLowerCase() === "customer";

                                            return (

                                                <div
                                                    key={message._id}
                                                    className={`admin-message ${customer ? "customer" : "support"}`}
                                                >

                                                    <div className="admin-message-avatar">

                                                        {
                                                            customer
                                                                ? <User size={18} />
                                                                : <Package size={18} />
                                                        }

                                                    </div>


                                                    <div className="admin-message-body">

                                                        <div className="admin-message-meta">

                                                            <strong>
                                                                {customer ? "Customer" : "Support"}
                                                            </strong>

                                                            <span>
                                                                {
                                                                    new Date(message.createdAt).toLocaleString(
                                                                        "en-IN",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit"
                                                                        }
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                        <p>
                                                            {message.message}
                                                        </p>

                                                        {

                                                            message.attachments?.length > 0 && (

                                                                <div className="admin-message-attachments">

                                                                    {

                                                                        message.attachments.map(file => (

                                                                            <a
                                                                                key={file._id || file.public_id}
                                                                                href={file.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="admin-attachment-thumb"
                                                                            >

                                                                                <img
                                                                                    src={file.url}
                                                                                    alt="Attachment"
                                                                                />

                                                                            </a>

                                                                        ))

                                                                    }

                                                                </div>

                                                            )

                                                        }

                                                    </div>

                                                </div>

                                            );

                                        })

                                }

                            </div>


                            {/* Reply */}

                            {

                                ticket.status !== "Closed" && (

                                    <form
                                        className="admin-reply-form"
                                        onSubmit={handleReply}
                                    >

                                        <textarea
                                            rows={5}
                                            placeholder="Write your reply to the customer..."
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                        />

                                        <button
                                            type="submit"
                                            disabled={replyLoading}
                                        >

                                            <Send size={17} />

                                            {replyLoading ? "Sending..." : "Send Reply"}

                                        </button>

                                    </form>

                                )

                            }

                        </div>

                    </div>


                    {/* Sidebar */}

                    <div>

                        <div className="admin-info-card">

                            <h2>
                                Customer
                            </h2>

                            <div className="admin-customer">

                                <div className="admin-customer-icon">
                                    <User size={20} />
                                </div>

                                <div>

                                    <strong>
                                        {ticket.customer?.name || "Unknown"}
                                    </strong>

                                    <span>
                                        <Mail size={13} />
                                        {ticket.customer?.email || "-"}
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="admin-info-card">

                            <h2>
                                Ticket Information
                            </h2>

                            <InfoRow label="Priority" value={ticket.priority} />

                            <InfoRow label="Category" value={ticket.category} />

                            <InfoRow label="Issue" value={ticket.issueType} />

                            <InfoRow
                                label="Created"
                                value={
                                    new Date(ticket.createdAt).toLocaleDateString("en-IN")
                                }
                            />

                        </div>


                        {/* Order — field names match the actual API response
                            (orderNumber / finalAmount), not orderId / totalAmount. */}

                        {

                            ticket.order && (

                                <div className="admin-info-card">

                                    <h2>
                                        Related Order
                                    </h2>

                                    <InfoRow
                                        label="Order Number"
                                        value={ticket.order.orderNumber || ticket.order._id}
                                    />

                                    <InfoRow
                                        label="Order Status"
                                        value={ticket.order.orderStatus}
                                    />

                                    <InfoRow
                                        label="Payment"
                                        value={ticket.order.paymentStatus}
                                    />

                                    <InfoRow
                                        label="Amount"
                                        value={`₹${ticket.order.finalAmount || 0}`}
                                    />

                                </div>

                            )

                        }

                    </div>

                </div>

            </div>

        </div>

    );

};


const InfoRow = ({ label, value }) => {

    return (

        <div className="admin-info-row">

            <span>
                {label}
            </span>

            <strong>
                {value || "-"}
            </strong>

        </div>

    );

};


export default AdminTicketDetails;