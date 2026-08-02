import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./TicketDetails.css";

import TicketHeader from "../../components/support/TicketHeader";
import ConversationTimeline from "../../components/support/ConversationTimeline";
import ReplyBox from "../../components/support/ReplyBox";
import TicketInfoSidebar from "../../components/support/TicketInfoSidebar";
import StatusTimeline from "../../components/support/StatusTimeline";
import AttachmentGallery from "../../components/support/AttachmentGallery";
import LoadingSkeleton from "../../components/support/LoadingSkeleton";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getTicketApi } from "../../services/supportService";

const TicketDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTicket = async () => {

        try {

            setLoading(true);

            const res = await getTicketApi(id);

            console.log("Ticket Details:", res.data);

            const response = res.data.data;

            // Flatten API response
            setTicket({
                ...response.ticket,
                messages: response.messages || []
            });

        } catch (err) {

            console.error("Fetch Ticket Error:", err);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchTicket();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }, [id]);


    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!ticket) {
        return (
            <div className="ticket-details-page">
                <h2 style={{ textAlign: "center", marginTop: "80px" }}>
                    Ticket Not Found
                </h2>
            </div>
        );
    }

    return (

        <div className="ticket-details-page">

            <div className="ticket-details-container">

                <div className="ticket-top-actions">

                    <button
                        className="ticket-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <button
                        className="ticket-shopping-btn"
                        onClick={() => navigate("/")}
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </button>

                </div>


                {/* Header */}

                <TicketHeader ticket={ticket} />

                <div className="ticket-details-layout">

                    {/* Left Side */}

                    <div>

                        <ConversationTimeline
                            messages={ticket.messages}
                        />

                        <StatusTimeline
                            activities={
                                ticket.order?.statusHistory || []
                            }
                        />

                        <AttachmentGallery
                            attachments={ticket.attachments || []}
                        />

                        <ReplyBox
                            ticketId={ticket._id}
                            ticketStatus={ticket.status}
                        />

                    </div>

                    {/* Right Side */}

                    <div>

                        <TicketInfoSidebar
                            ticket={ticket}
                        />

                        {/* <StatusTimeline
                            activities={
                                ticket.order?.statusHistory || []
                            }
                        /> */}

                    </div>

                </div>

            </div>

        </div>

    );

};

export default TicketDetails;