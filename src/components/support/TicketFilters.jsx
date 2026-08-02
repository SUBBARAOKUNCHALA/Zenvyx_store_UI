import { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";

const TicketFilters = ({ tickets, setFilteredTickets }) => {

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("");

    const [priority, setPriority] = useState("");

    const [category, setCategory] = useState("");

    useEffect(() => {

        let filtered = [...tickets];

        if (search) {

            filtered = filtered.filter(ticket =>
                ticket.ticketId.toLowerCase().includes(search.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(search.toLowerCase())
            );

        }

        if (status) {

            filtered = filtered.filter(ticket =>
                ticket.status === status
            );

        }

        if (priority) {

            filtered = filtered.filter(ticket =>
                ticket.priority === priority
            );

        }

        if (category) {

            filtered = filtered.filter(ticket =>
                ticket.category === category
            );

        }

        setFilteredTickets(filtered);

    }, [tickets, search, status, priority, category, setFilteredTickets]);

    const clearFilters = () => {

        setSearch("");

        setStatus("");

        setPriority("");

        setCategory("");

    };

    const categories = [...new Set(tickets.map(item => item.category))];

    return (

        <div className="ticket-filters">

            <div className="search-box">

                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search by Ticket ID or Subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </div>

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >

                <option value="">

                    All Status

                </option>

                <option>

                    Open

                </option>

                <option>

                    Pending

                </option>

                <option>

                    Waiting for Customer

                </option>

                <option>

                    In Progress

                </option>

                <option>

                    Resolved

                </option>

                <option>

                    Closed

                </option>

            </select>

            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
            >

                <option value="">

                    All Priorities

                </option>

                <option>

                    Low

                </option>

                <option>

                    Medium

                </option>

                <option>

                    High

                </option>

                <option>

                    Critical

                </option>

            </select>

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >

                <option value="">

                    All Categories

                </option>

                {

                    categories.map(category => (

                        <option
                            key={category}
                            value={category}
                        >

                            {category}

                        </option>

                    ))

                }

            </select>

            <button
                className="clear-filter-btn"
                onClick={clearFilters}
                type="button"
            >

                <RotateCcw size={17} />

                Clear

            </button>

        </div>

    );

};

export default TicketFilters;