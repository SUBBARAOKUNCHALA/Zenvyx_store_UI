import "./ContactUs.css";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {createContactApi} from "../services/authService";
const ContactUs = () => {

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    useEffect(() => {
        console.log("Mounted");
        console.log(window.scrollY);

        window.scrollTo(0, 0);

        setTimeout(() => {
            console.log("After scroll:", window.scrollY);
        }, 100);
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await createContactApi(form);

            //alert(res.data.message);

            setForm({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            //alert(err.response?.data?.message || "Something went wrong");
        }
    };
    return (

        <div className="contactPage">
            <div className="breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <span className="activeBreadcrumb">Contact Us</span>
            </div>
            {/* Hero */}

            <div className="contactHero">

                <h1>Contact Us</h1>

                <p>
                    We'd love to hear from you. Whether you have a question about your
                    order, returns, products or anything else, our team is ready to help.
                </p>

            </div>

            {/* Contact Details */}

            <div className="contactDetails">

                <div className="contactCard">

                    <Phone size={28} />

                    <h3>Phone</h3>

                    <p>+91 9876543210</p>

                </div>

                <div className="contactCard">

                    <Mail size={28} />

                    <h3>Email</h3>

                    <p>support@zenvyx.com</p>

                </div>

                <div className="contactCard">

                    <MapPin size={28} />

                    <h3>Address</h3>

                    <p>Hyderabad, Telangana, India</p>

                </div>

                <div className="contactCard">

                    <Clock size={28} />

                    <h3>Working Hours</h3>

                    <p>Mon - Sat : 9AM - 7PM</p>

                </div>

            </div>

            {/* Form */}

            <div className="contactContainer">

                <div className="contactForm">

                    <h2>Send us a Message</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="text"
                            placeholder="Your Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Phone Number"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            placeholder="Subject"
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            rows="6"
                            placeholder="Write your message..."
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit">
                            Send Message
                        </button>

                    </form>

                </div>

            </div>

            {/* FAQ */}

            <div className="faqSection">

                <h2>Frequently Asked Questions</h2>

                <div className="faq">

                    <h4>How long does shipping take?</h4>

                    <p>Orders are usually delivered within 3-7 business days.</p>

                </div>

                <div className="faq">

                    <h4>Can I return a product?</h4>

                    <p>You can return eligible products within 7 days.</p>

                </div>

                <div className="faq">

                    <h4>How can I track my order?</h4>

                    <p>Go to My Orders and click Track Order.</p>

                </div>

            </div>

            {/* Map */}

            <div className="mapContainer">

                <iframe
                    title="map"
                    src="https://www.google.com/maps?q=Hyderabad&output=embed"
                    loading="lazy"
                />

            </div>

        </div>

    );

};

export default ContactUs;