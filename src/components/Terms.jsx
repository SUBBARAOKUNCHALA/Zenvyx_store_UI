import React from "react";
import "./Terms.css";

const Terms = () => {
  return (
    <div className="termsPage">
      <div className="termsContainer">
        <h1>Terms & Conditions</h1>
        <p className="lastUpdated">Last updated: {new Date().toDateString()}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to ZENVYX. By accessing or using our platform, you agree to
            comply with these Terms & Conditions. If you do not agree, please do
            not use our services.
          </p>
        </section>

        <section>
          <h2>2. User Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and password. Any activity under your account is your
            responsibility.
          </p>
        </section>

        <section>
          <h2>3. Products & Pricing</h2>
          <p>
            We strive to provide accurate product details. However, pricing or
            product descriptions may occasionally contain errors. We reserve the
            right to cancel such orders.
          </p>
        </section>

        <section>
          <h2>4. Orders & Payments</h2>
          <p>
            Orders can be placed using Cash on Delivery, UPI, Net Banking, or
            other supported methods. All payments are processed securely via
            trusted payment gateways.
          </p>
        </section>

        <section>
          <h2>5. Returns & Refunds</h2>
          <p>
            Products can be returned within the allowed return window if unused
            and with original packaging. Refund timelines depend on the payment
            method.
          </p>
        </section>

        <section>
          <h2>6. User Conduct</h2>
          <p>
            Users must not misuse the platform, engage in fraud, or violate any
            laws. Any such activity may result in account suspension.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            ZENVYX is not liable for indirect or incidental damages arising from
            the use of our platform or products.
          </p>
        </section>

        <section>
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Continued use
            of the platform means you accept the changes.
          </p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>
            For any queries, contact us at: support@zenvyx.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;