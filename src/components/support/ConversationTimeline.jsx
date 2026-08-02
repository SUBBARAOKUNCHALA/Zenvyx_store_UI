import {
    User,
    Headset,
    Paperclip,
    Download
} from "lucide-react";

const ConversationTimeline = ({ messages = [] }) => {

    return (

        <div className="conversation-card">

            <div className="conversation-header">

                <h2>
                    Conversation
                </h2>

                <p>
                    All communication related to this ticket.
                </p>

            </div>

            <div className="conversation-list">

                {
                    messages.length === 0 ? (

                        <div className="conversation-empty">

                            No conversation available.

                        </div>

                    ) : (

                        messages.map((item) => {

                            const isCustomer =
                                item.senderType?.toLowerCase() === "customer";

                            return (

                                <div
                                    key={item._id}
                                    className={`conversation-item ${isCustomer ? "customer" : "admin"}`}
                                >

                                    {/* Support Avatar */}

                                    {
                                        !isCustomer && (

                                            <div className="conversation-avatar">

                                                <Headset size={20} />

                                            </div>

                                        )
                                    }

                                    {/* Message Bubble */}

                                    <div className="conversation-content">

                                        <div className="conversation-top">

                                            <h4>

                                                {
                                                    isCustomer
                                                        ? "You"
                                                        : item.sender?.name || "Support Executive"
                                                }

                                            </h4>

                                            <span>

                                                {
                                                    new Date(item.createdAt).toLocaleString(
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

                                            {item.message}

                                        </p>

                                        {
                                            item.attachments &&
                                            item.attachments.length > 0 && (

                                                <div className="attachment-gallery">

                                                    {

                                                        item.attachments.map((file, index) => (

                                                            <a
                                                                key={index}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="attachment-file"
                                                            >

                                                                <Paperclip size={15} />

                                                                <span>

                                                                    {file.fileName}

                                                                </span>

                                                                <Download size={15} />

                                                            </a>

                                                        ))

                                                    }

                                                </div>

                                            )
                                        }

                                    </div>

                                    {/* Customer Avatar */}

                                    {
                                        isCustomer && (

                                            <div className="conversation-avatar">

                                                <User size={20} />

                                            </div>

                                        )
                                    }

                                </div>

                            );

                        })

                    )

                }

            </div>

        </div>

    );

};

export default ConversationTimeline;