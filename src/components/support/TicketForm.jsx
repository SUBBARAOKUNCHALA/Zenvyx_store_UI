import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";

import OrderSelector from "./OrderSelector";
import AttachmentUploader from "./AttachmentUploader";
import {createSupportTicketApi } from "../../services/supportService"
import { useNavigate } from "react-router-dom";
import "./TicketForm.css";

const categories = [
    "Order Issue",
    "Payment Issue",
    "Delivery Issue",
    "Return & Refund",
    "Product Issue",
    "Account Issue",
    "Technical Issue",
    "Other"
];

const priorities = [
    "Low",
    "Medium",
    "High",
    "Critical"
];

const TicketForm = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        category: "",
        issueType: "",
        order: "",
        subject: "",
        description: "",
        priority: "Medium"
    });

    const [attachments, setAttachments] = useState([]);

    useEffect(() => {

        const category = searchParams.get("category");

        if (category) {

            setForm(prev => ({
                ...prev,
                category
            }));

        }

    }, [searchParams]);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        const formData = new FormData();

        formData.append("category", form.category);
        formData.append("issueType", form.issueType);
        formData.append("orderId", form.order);
        formData.append("subject", form.subject);
        formData.append("description", form.description);
        formData.append("priority", form.priority);

        attachments.forEach((file) => {
            formData.append("attachments", file);
        });

        const res = await createSupportTicketApi(formData);

        //alert(res.data.message);

        navigate("/help/my-tickets");

    } catch (err) {

        // alert(
        //     err.response?.data?.message ||
        //     "Unable to create support ticket."
        // );

    }

};
    return (

        <div className="ticket-form-card">

            <div className="ticket-form-header">

                <h2>Create Support Ticket</h2>

                <p>

                    Fill in the details below. Our support team will respond as soon as possible.

                </p>

            </div>

            <form
                className="ticket-form"
                onSubmit={handleSubmit}
            >

                <div className="form-row">

                    <div className="form-group">

                        <label>

                            Category <span>*</span>

                        </label>

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >

                            <option value="">

                                Select Category

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

                    </div>

                    <div className="form-group">

                        <label>

                            Priority

                        </label>

                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                        >

                            {

                                priorities.map(priority => (

                                    <option
                                        key={priority}
                                    >

                                        {priority}

                                    </option>

                                ))

                            }

                        </select>

                    </div>

                </div>

                <div className="form-group">

                    <label>

                        Issue Type <span>*</span>

                    </label>

                    <input
                        type="text"
                        name="issueType"
                        value={form.issueType}
                        onChange={handleChange}
                        placeholder="Payment deducted but order not placed"
                        required
                    />

                </div>

                <OrderSelector

                    value={form.order}

                    onChange={handleChange}

                />

                <div className="form-group">

                    <label>

                        Subject <span>*</span>

                    </label>

                    <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Enter ticket subject"
                        required
                    />

                </div>

                <div className="form-group">

                    <label>

                        Description <span>*</span>

                    </label>

                    <textarea
                        rows="7"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Please explain your issue in detail..."
                        required
                    />

                </div>

                <AttachmentUploader

                    attachments={attachments}

                    setAttachments={setAttachments}

                />

                <button
                    className="submit-ticket-btn"
                    type="submit"
                >

                    <Send size={18} />

                    Submit Ticket

                </button>

            </form>

        </div>

    );

};

export default TicketForm;