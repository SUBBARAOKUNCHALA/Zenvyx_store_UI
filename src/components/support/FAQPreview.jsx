import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "My payment was successful but my order was not placed.",
        answer:
            "If your payment was deducted but the order was not created, please wait for 10-15 minutes. If the issue persists, raise a support ticket with your payment screenshot and transaction ID."
    },
    {
        question: "How can I track my order?",
        answer:
            "Go to My Orders, select the order, and click Track Order to see the latest shipping updates."
    },
    {
        question: "How do I return a product?",
        answer:
            "Open My Orders, choose the delivered order, and click Return. Follow the instructions to schedule a pickup."
    },
    {
        question: "When will I receive my refund?",
        answer:
            "Refunds are generally processed within 5-7 business days after the returned item passes inspection."
    },
    {
        question: "How do I contact customer support?",
        answer:
            "You can raise a support ticket through the Help Center. Our support team will respond as soon as possible."
    }
];

const FAQPreview = () => {

    const [openIndex, setOpenIndex] = useState(0);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (

        <section className="faq-section">

            <div className="faq-header">

                <HelpCircle size={34} />

                <h2>Frequently Asked Questions</h2>

                <p>
                    Find quick answers to the most common customer questions.
                </p>

            </div>

            <div className="faq-list">

                {faqs.map((faq, index) => (

                    <div
                        key={index}
                        className={`faq-item ${openIndex === index ? "active" : ""}`}
                    >

                        <button
                            className="faq-question"
                            onClick={() => toggleFAQ(index)}
                        >

                            <span>{faq.question}</span>

                            {openIndex === index ? (
                                <ChevronUp size={22} />
                            ) : (
                                <ChevronDown size={22} />
                            )}

                        </button>

                        {openIndex === index && (

                            <div className="faq-answer">

                                <p>{faq.answer}</p>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </section>

    );

};

export default FAQPreview;