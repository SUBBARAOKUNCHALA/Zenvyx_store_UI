import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./MyTickets.css";

import TicketCard from "../../components/support/TicketCard";
import TicketFilters from "../../components/support/TicketFilters";
import EmptyTickets from "../../components/support/EmptyTickets";
import LoadingSkeleton from "../../components/support/LoadingSkeleton";

import { getMyTicketsApi } from "../../services/supportService";

const MyTickets = () => {

    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {

        try {

            setLoading(true);

            const res = await getMyTicketsApi();

            console.log("Ticket API Response:", res.data);

            const data = res?.data?.data || [];

            setTickets(data);
            setFilteredTickets(data);

        } catch (err) {

            console.error("Fetch Tickets Error:", err);

            setTickets([]);
            setFilteredTickets([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchTickets();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }, []);

    return (

        <div className="my-ticket-page">

            <div className="my-ticket-container">

                <div className="ticket-page-header">

                    <button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <h1>My Support Tickets</h1>

                    <p>
                        Track all your support requests in one place.
                    </p>

                </div>

                {
                    !loading && tickets.length > 0 && (

                        <TicketFilters
                            tickets={tickets}
                            setFilteredTickets={setFilteredTickets}
                        />

                    )
                }

                {
                    loading ?

                        <LoadingSkeleton />

                        :

                        filteredTickets.length === 0 ?

                            <EmptyTickets />

                            :

                            <div className="ticket-list">

                                {
                                    filteredTickets.map((ticket) => (

                                        <TicketCard
                                            key={ticket._id}
                                            ticket={ticket}
                                        />

                                    ))
                                }

                            </div>
                }

            </div>

        </div>

    );

};

export default MyTickets;