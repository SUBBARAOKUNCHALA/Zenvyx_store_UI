import { useState } from "react";
import { Send } from "lucide-react";
import AttachmentUploader from "./AttachmentUploader";
import { replyTicketApi } from "../../services/supportService";

const ReplyBox = ({
    ticketId,
    ticketStatus = "Open",
    onReplySuccess
}) => {

    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);

    const isClosed =
        ticketStatus === "Closed" ||
        ticketStatus === "Resolved";

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!message.trim() && attachments.length === 0) {
            //alert("Please enter a reply or upload an attachment.");
            return;
        }

        try {

            setLoading(true);

            //const formData = new FormData();

            //formData.append("message", message);

            // attachments.forEach(file => {
            //     formData.append("attachments", file);
            // });


            await replyTicketApi(ticketId, {
                message,
            });

            //////alert("Reply sent successfully.");

            setMessage("");
            setAttachments([]);

            // Refresh conversation
            if (onReplySuccess) {
                onReplySuccess();
            }

        } catch (err) {

            console.error(err);

            // alert(
            //     err?.response?.data?.message ||
            //     "Failed to send reply."
            // );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="reply-box">

            <h2>

                Reply to Support

            </h2>

            {
                isClosed && (

                    <div className="ticket-closed-banner">

                        This ticket has been closed.
                        You cannot send additional replies.

                    </div>

                )
            }

            <form onSubmit={handleSubmit}>

                <textarea
                    rows={6}
                    placeholder="Write your reply..."
                    value={message}
                    disabled={isClosed}
                    onChange={(e) => setMessage(e.target.value)}
                />

                {/* {
                    !isClosed && (

                        <AttachmentUploader
                            attachments={attachments}
                            setAttachments={setAttachments}
                        />

                    )
                } */}

                <button
                    type="submit"
                    disabled={loading || isClosed}
                    className="reply-submit-btn"
                >

                    <Send size={18} />

                    {
                        loading
                            ? "Sending..."
                            : "Send Reply"
                    }

                </button>

            </form>

        </div>

    );

};

export default ReplyBox;