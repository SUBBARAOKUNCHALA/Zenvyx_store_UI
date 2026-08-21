import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { registerUser, googleAuthUser } from "../services/authService";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setApiError("");
    };

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Username is required";
        } else if (form.name.trim().length < 3) {
            newErrors.name = "Username must be at least 3 characters";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const res = await registerUser({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            const { token, _id, name, email } = res.data.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ _id, name, email }));

            toast.success("Registration successful");
            navigate("/login");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                "Registration failed. Please try again.";
            setApiError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const googleToken = credentialResponse.credential;

            const res = await googleAuthUser({ token: googleToken });
            //console.log("Google data",res.data.data)

            const { token, _id, name, email } = res.data.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ _id, name, email }));

            // toast.success("Google signup successful");
            navigate("/");
        } catch (err) {
            const msg =
                err?.response?.data?.message || "Google signup failed";
            setApiError(msg);
            toast.error(msg);
        }
    };

    const handleGoogleError = () => {
        toast.error("Google sign-in failed");
    };

    return (
        <div className="page">
            <motion.div
                className="container"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="left">
                    <h1 className="title">Create Account</h1>
                    <p className="subtitle">Join us and start your journey</p>

                    {apiError && <div className="apiError">{apiError}</div>}

                    <form onSubmit={handleSubmit} className="form" noValidate>
                        <div className="fieldGroup">
                            <input
                                type="text"
                                name="name"
                                placeholder="Username"
                                value={form.name}
                                onChange={handleChange}
                                className={`input ${errors.name ? "inputError" : ""}`}
                            />
                            {errors.name && <span className="errorMsg">{errors.name}</span>}
                        </div>

                        <div className="fieldGroup">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={handleChange}
                                className={`input ${errors.email ? "inputError" : ""}`}
                            />
                            {errors.email && <span className="errorMsg">{errors.email}</span>}
                        </div>

                        <div className="fieldGroup">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                className={`input ${errors.password ? "inputError" : ""}`}
                            />
                            {errors.password && <span className="errorMsg">{errors.password}</span>}
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: loading ? 1 : 1.03 }}
                            whileTap={{ scale: loading ? 1 : 0.97 }}
                            className="button"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </motion.button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="googleWrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap={false}
                        />
                    </div>
                </div>

                <div className="right">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="rightTitle">Welcome</h2>
                        <p className="rightText">
                            Already have an account? Login and continue your experience.
                        </p>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            className="loginBtn"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </motion.button>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            className="continueShoppingBtn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;