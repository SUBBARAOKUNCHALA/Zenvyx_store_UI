import { useEffect, useState } from "react";
import {
    Ticket,
    CircleAlert,
    Clock3,
    CheckCircle2,
    XCircle,
    TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    getSupportDashboardApi
} from "../../../services/adminSupportService";

import "./SupportDashboard.css";

// Turns "Waiting for Customer" into "waiting-for-customer" so it's a
// single valid CSS class instead of several broken ones.
const toStatusClass = (status) =>
    status ? status.toLowerCase().trim().replace(/\s+/g, "-") : "";

const SupportDashboard = () => {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getSupportDashboardApi();

            setDashboard(res?.data?.data || null);
        } catch (err) {
            console.error("Support Dashboard Error:", err);
            setError(
                err?.response?.data?.message ||
                "Failed to load the support dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const stats = dashboard || {};

    return (

        <div className="admin-support-dashboard">

            <div className="admin-support-header">

                <div>

                    <h1>
                        Support Dashboard
                    </h1>

                    <p>
                        Manage customer support tickets and requests.
                    </p>

                </div>

                <button
                    className="view-all-support-btn"
                    onClick={() =>
                        navigate("/~fiadmin/support/tickets")
                    }
                >
                    <Ticket size={18} />
                    View All Tickets
                </button>

            </div>

            {

                error && (
                    <div className="support-no-data" style={{ marginBottom: 20 }}>
                        {error}
                    </div>
                )

            }

            <div className="support-stats-grid">

                <StatCard
                    title="Total Tickets"
                    value={loading ? "…" : stats.total ?? 0}
                    icon={<Ticket size={22} />}
                />

                <StatCard
                    title="Open"
                    value={loading ? "…" : stats.open ?? 0}
                    icon={<CircleAlert size={22} />}
                />

                <StatCard
                    title="Pending"
                    value={loading ? "…" : stats.pending ?? 0}
                    icon={<Clock3 size={22} />}
                />

                <StatCard
                    title="Resolved"
                    value={loading ? "…" : stats.resolved ?? 0}
                    icon={<CheckCircle2 size={22} />}
                />

                <StatCard
                    title="Closed"
                    value={loading ? "…" : stats.closed ?? 0}
                    icon={<XCircle size={22} />}
                />

                <StatCard
                    title="Critical"
                    value={loading ? "…" : stats.critical ?? 0}
                    icon={<TrendingUp size={22} />}
                />

            </div>


            <div className="recent-support-card">

                <div className="recent-support-header">

                    <div>

                        <h2>
                            Recent Tickets
                        </h2>

                        <p>
                            Latest customer support requests
                        </p>

                    </div>

                </div>

                <div className="recent-support-list">

                    {

                        loading ?

                            <div className="support-no-data">
                                Loading…
                            </div>

                            : dashboard?.recentTickets?.length ?

                                dashboard.recentTickets.map(ticket => (

                                    <div
                                        key={ticket._id}
                                        className="recent-support-item"
                                        onClick={() =>
                                            navigate(`/~fiadmin/support/${ticket._id}`)
                                        }
                                        style={{ cursor: "pointer" }}
                                    >

                                        <div>

                                            <strong>
                                                {ticket.ticketId}
                                            </strong>

                                            <p>
                                                {ticket.subject}
                                            </p>

                                        </div>

                                        <span
                                            className={`admin-ticket-status ${toStatusClass(ticket.status)}`}
                                        >
                                            {ticket.status}
                                        </span>

                                    </div>

                                ))

                                :

                                <div className="support-no-data">
                                    No recent tickets.
                                </div>

                    }

                </div>

            </div>

        </div>

    );

};


const StatCard = ({
    title,
    value,
    icon
}) => {

    return (

        <div className="support-stat-card">

            <div className="support-stat-icon">
                {icon}
            </div>

            <div>

                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>

    );

};


export default SupportDashboard;