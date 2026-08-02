import "./RaiseTicket.css";

import TicketForm from "../../components/support/TicketForm";
import IssueTips from "../../components/support/IssueTips";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RaiseTicket = () => {
    const navigate = useNavigate();


    useEffect(() => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });
}, []);

    return (

        <div className="raise-ticket-page">

            <div className="raise-ticket-container">

                <div className="raise-ticket-header">

                    <button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    <h1>Raise a Support Ticket</h1>

                    <p>
                        Tell us about your issue and our support team
                        will get back to you as soon as possible.
                    </p>

                </div>

                <div className="raise-ticket-layout">

                    <TicketForm />

                    <IssueTips />

                </div>

            </div>

        </div>

    );

};

export default RaiseTicket;