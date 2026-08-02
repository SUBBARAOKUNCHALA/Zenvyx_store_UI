import { useState } from "react";
import {
    CheckCircle2,
    Package,
    Truck,
    XCircle,
    RotateCcw,
    ChevronDown,
    ChevronUp
} from "lucide-react";

import "./StatusTimeline.css";

const StatusTimeline = ({ activities = [] }) => {

    const [showTimeline, setShowTimeline] = useState(false);

    const getIcon = (status) => {

        switch (status?.toLowerCase()) {

            case "placed":
                return <Package size={18} />;

            case "confirmed":
                return <CheckCircle2 size={18} />;

            case "processing":
                return <Package size={18} />;

            case "shipped":
                return <Truck size={18} />;

            case "delivered":
                return <CheckCircle2 size={18} />;

            case "cancelled":
                return <XCircle size={18} />;

            case "returned":
                return <RotateCcw size={18} />;

            default:
                return <Package size={18} />;
        }

    };

    return (

        <div className="status-timeline-card">

            <div className="timeline-header">

                <h2>

                    Order Timeline

                </h2>

                {

                    activities.length > 0 && (

                        <button
                            className="timeline-toggle-btn"
                            onClick={() => setShowTimeline(!showTimeline)}
                        >

                            {

                                showTimeline ?

                                    <>
                                        Hide Order Status
                                        <ChevronUp size={18} />
                                    </>

                                    :

                                    <>
                                        View Order Status
                                        <ChevronDown size={18} />
                                    </>

                            }

                        </button>

                    )

                }

            </div>

            {

                showTimeline && (

                    activities.length === 0 ?

                        (

                            <div className="timeline-empty">

                                No order updates available.

                            </div>

                        )

                        :

                        (

                            <div className="horizontal-timeline">

                                {

                                    activities.map((item, index) => (

                                        <div
                                            key={index}
                                            className="timeline-step"
                                        >

                                            <div className="timeline-circle">

                                                {getIcon(item.status)}

                                            </div>

                                            {

                                                index !== activities.length - 1 &&

                                                <div className="timeline-line" />

                                            }

                                            <h4>

                                                {item.status}

                                            </h4>

                                            <p>

                                                {item.note}

                                            </p>

                                            <span>

                                                {

                                                    new Date(item.changedAt)
                                                        .toLocaleString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })

                                                }

                                            </span>

                                        </div>

                                    ))

                                }

                            </div>

                        )

                )

            }

        </div>

    );

};

export default StatusTimeline;