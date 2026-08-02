import "./IssueTips.css";

import {
    Lightbulb,
    Clock3,
    Paperclip,
    ShieldCheck,
    CircleAlert,
    CheckCircle2
} from "lucide-react";

const IssueTips = () => {

    return (

        <div className="issue-tips">

            {/* Before Submit */}

            <div className="tips-card">

                <div className="tips-title">

                    <Lightbulb className="tips-icon" size={22} />

                    <h3>Before You Submit</h3>

                </div>

                <ul>

                    <li>
                        <CheckCircle2 size={16} />
                        Clearly explain your issue.
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        Mention your Order ID whenever possible.
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        Upload screenshots or payment proof.
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        Avoid creating duplicate tickets.
                    </li>

                </ul>

            </div>

            {/* Response Time */}

            <div className="tips-card">

                <div className="tips-title">

                    <Clock3 className="tips-icon" size={22} />

                    <h3>Response Time</h3>

                </div>

                <p>

                    Our support team usually replies within

                    <strong> 24 Hours </strong>

                    on business days.

                </p>

            </div>

            {/* Attachments */}

            <div className="tips-card">

                <div className="tips-title">

                    <Paperclip className="tips-icon" size={22} />

                    <h3>Supported Files</h3>

                </div>

                <ul>

                    <li>
                        <CheckCircle2 size={16} />
                        Payment Screenshot
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        Invoice / Bill
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        Product Images
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        Packaging Photos
                    </li>

                    <li>
                        <CheckCircle2 size={16} />
                        PDF Documents
                    </li>

                </ul>

            </div>

            {/* Privacy */}

            <div className="tips-card">

                <div className="tips-title">

                    <ShieldCheck className="tips-icon" size={22} />

                    <h3>Privacy & Security</h3>

                </div>

                <p>

                    Your attachments are encrypted and can only be viewed
                    by authorized support staff.

                </p>

            </div>

            {/* Warning */}

            <div className="tips-card warning-card">

                <div className="tips-title">

                    <CircleAlert size={22} />

                    <h3>Important</h3>

                </div>

                <p>

                    Never upload your OTP, ATM PIN,
                    CVV, passwords or banking credentials.

                </p>

            </div>

        </div>

    );

};

export default IssueTips;