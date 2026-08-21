import { useEffect, useState, useCallback } from "react";
import {
    Search,
    Eye,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import {
    getAllSupportTicketsApi,
    deleteSupportTicketApi
} from "../../../services/adminSupportService";

import { useNavigate } from "react-router-dom";

import "./SupportTickets.css";

// Adjust this list to match the actual categories your ticket-creation
// form sends — this just needs to be a fixed set so the filter dropdown
// doesn't shrink/grow depending on what's on the current page.
const CATEGORY_OPTIONS = [
    "Payment Issue",
    "Delivery Issue",
    "Product Issue",
    "Order Issue",
    "Other",
];

const toStatusClass = (status) =>
    status ? status.toLowerCase().trim().replace(/\s+/g, "-") : "";

const SupportTickets = () => {

    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");
    const [category, setCategory] = useState("All");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Debounce the free-text search so we don't fire a request per keystroke.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchTickets = useCallback(async () => {

        try {

            setLoading(true);
            setErrorMsg(null);

            const params = { page, limit: 10 };

            if (status !== "All") params.status = status;
            if (priority !== "All") params.priority = priority;
            if (category !== "All") params.category = category;
            if (debouncedSearch) params.search = debouncedSearch;

            const res = await getAllSupportTicketsApi(params);

            setTickets(res?.data?.data || []);
            setTotalPages(res?.data?.totalPages || 1);
            setTotal(res?.data?.total ?? 0);

        } catch (error) {

            console.error("Fetch Tickets Error:", error);

            setTickets([]);
            setErrorMsg(
                error?.response?.data?.message ||
                "Failed to load tickets."
            );

        } finally {

            setLoading(false);

        }

    }, [page, status, priority, category, debouncedSearch]);


    useEffect(() => {

        fetchTickets();

    }, [fetchTickets]);


    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1);
    };


    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this ticket?"
        );

        if (!confirmed) return;

        try {

            await deleteSupportTicketApi(id);

            alert("Ticket deleted successfully.");

            // Re-fetch instead of splicing local state, so counts and
            // pagination stay in sync with the database.
            fetchTickets();

        } catch (error) {

            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Failed to delete ticket."
            );

        }

    };


    return (

        <div className="admin-support-tickets">

            <div className="support-tickets-header">

                <div>

                    <h1>
                        Support Tickets
                    </h1>

                    <p>
                        Manage and respond to customer support requests.
                    </p>

                </div>

                <button
                    className="refresh-ticket-btn"
                    onClick={fetchTickets}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>

            </div>


            {/* Filters */}

            <div className="support-ticket-filters">

                <div className="support-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search ticket, customer or subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>


                <select
                    value={status}
                    onChange={handleFilterChange(setStatus)}
                >

                    <option value="All">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Waiting for Customer">Waiting for Customer</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>

                </select>


                <select
                    value={priority}
                    onChange={handleFilterChange(setPriority)}
                >

                    <option value="All">All Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>

                </select>


                <select
                    value={category}
                    onChange={handleFilterChange(setCategory)}
                >

                    <option value="All">All Categories</option>

                    {
                        CATEGORY_OPTIONS.map(item => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))
                    }

                </select>

            </div>


            {/* Table */}

            <div className="support-table-wrapper">

                {

                    loading ?

                        <div className="support-loading">
                            Loading tickets...
                        </div>

                        : errorMsg ?

                            <div className="support-empty">
                                {errorMsg}
                            </div>

                            : tickets.length === 0 ?

                                <div className="support-empty">
                                    No support tickets found.
                                </div>

                                :

                                <table className="support-ticket-table">

                                    <thead>

                                        <tr>
                                            <th>Ticket</th>
                                            <th>Customer</th>
                                            {/* <th>Subject</th> */}
                                            <th>Category</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {
                                            tickets.map(ticket => (

                                                <tr key={ticket._id}>

                                                    <td>
                                                        <strong className="ticket-id">
                                                            {ticket.ticketId}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <div className="customer-cell">
                                                            <strong>
                                                                {ticket.customer?.name || "Unknown"}
                                                            </strong>
                                                            <small>
                                                                {ticket.customer?.email || "-"}
                                                            </small>
                                                        </div>
                                                    </td>

                                                    {/* <td>
                                                        <span className="subject-cell">
                                                            {ticket.subject}
                                                        </span>
                                                    </td> */}

                                                    <td>
                                                        {ticket.category}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`priority-badge ${toStatusClass(ticket.priority)}`}
                                                        >
                                                            {ticket.priority}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${toStatusClass(ticket.status)}`}
                                                        >
                                                            {ticket.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            new Date(ticket.createdAt).toLocaleDateString("en-IN")
                                                        }
                                                    </td>

                                                    <td>
                                                        <div className="ticket-actions">

                                                            <button
                                                                title="View Ticket"
                                                                onClick={() =>
                                                                    navigate(`/~fiadmin/support/${ticket._id}`)
                                                                }
                                                            >
                                                                <Eye size={17} />
                                                            </button>

                                                            <button
                                                                title="Delete Ticket"
                                                                className="delete-ticket-btn"
                                                                onClick={() => handleDelete(ticket._id)}
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>

                                                        </div>
                                                    </td>

                                                </tr>

                                            ))
                                        }

                                    </tbody>

                                </table>

                }

            </div>

            {/* Pagination */}

            {

                !loading && !errorMsg && tickets.length > 0 && (

                    <div className="support-pagination">

                        <span className="support-pagination-info">
                            Page {page} of {totalPages} &middot; {total} ticket{total === 1 ? "" : "s"}
                        </span>

                        <div className="support-pagination-controls">

                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>

                        </div>

                    </div>

                )

            }

        </div>

    );

};

export default SupportTickets;