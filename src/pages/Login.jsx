import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
    loginUser,
    sendOtp,
    validateOtp,
    resetPasswordWithOtp,
    googleAuthUser,
} from "../services/authService";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showResetScreen, setShowResetScreen] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState("");
    const [resetForm, setResetForm] = useState({
        password: "",
        confirmPassword: "",
    });
    const [resetLoading, setResetLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setApiError("");
    };

    const handleResetChange = (e) => {
        setResetForm({ ...resetForm, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setApiError("");
    };

    const validate = () => {
        const newErrors = {};

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

    const validateResetForm = () => {
        const newErrors = {};

        if (!resetForm.password) {
            newErrors.resetPassword = "New password is required";
        } else if (resetForm.password.length < 6) {
            newErrors.resetPassword = "Password must be at least 6 characters";
        }

        if (!resetForm.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (resetForm.password !== resetForm.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
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
            const res = await loginUser({
                email: form.email.trim(),
                password: form.password,
            });

            const { token, _id, name, email } = res.data.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ _id, name, email }));

            toast.success("Login successful");
            navigate("/");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                "Login failed. Please check your credentials.";
            setApiError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setApiError("");
        setOtpMessage("");

        if (!form.email.trim()) {
            setErrors((prev) => ({
                ...prev,
                email: "Enter your email first to reset password",
            }));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setErrors((prev) => ({
                ...prev,
                email: "Enter a valid email to reset password",
            }));
            return;
        }

        try {
            setLoading(true);

            await sendOtp({ email: form.email.trim() });

            toast.success("OTP sent to your email");
            setShowResetScreen(true);
            setOtp("");
            setOtpVerified(false);
            setResetForm({ password: "", confirmPassword: "" });
            setOtpMessage("OTP sent to your email");
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to send OTP";
            setApiError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = async (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        setOtp(value);
        setApiError("");
        setOtpMessage("");

        if (value.length === 6 && !otpVerified) {
            try {
                setOtpLoading(true);

                const res = await validateOtp({
                    email: form.email.trim(),
                    otp: value,
                });

                if (res.data.success) {
                    setOtpVerified(true);
                    setOtpMessage("OTP verified successfully");
                    toast.success("OTP verified successfully");
                }
            } catch (err) {
                const msg = err?.response?.data?.message || "Invalid OTP";
                setApiError(msg);
                toast.error(msg);
            } finally {
                setOtpLoading(false);
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setApiError("");

        const validationErrors = validateResetForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setResetLoading(true);

            const res = await resetPasswordWithOtp({
                email: form.email.trim(),
                otp,
                password: resetForm.password,
            });

            if (res.data.success) {
                toast.success("Password reset successful");

                setTimeout(() => {
                    setShowResetScreen(false);
                    setOtp("");
                    setOtpVerified(false);
                    setOtpMessage("");
                    setResetForm({ password: "", confirmPassword: "" });
                    setForm({ email: form.email, password: "" });
                }, 1500);
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message || "Password reset failed";
            setApiError(msg);
            toast.error(msg);
        } finally {
            setResetLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const googleToken = credentialResponse.credential;

            const res = await googleAuthUser({
                token: googleToken,
                mode: "login",
            });

            const { token, _id, name, email } = res.data.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ _id, name, email }));

            toast.success("Google login successful");
            navigate("/");
        } catch (err) {
            const msg = err?.response?.data?.message || "Google login failed";

            if (err?.response?.status === 404) {
                toast.error("Google account not registered. Please register first.");
                navigate("/register");
                return;
            }

            setApiError(msg);
            toast.error(msg);
        }
    };

    const handleGoogleError = () => {
        toast.error("Google login failed");
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
                    {!showResetScreen ? (
                        <>
                            <h1 className="title">Welcome Back</h1>
                            <p className="subtitle">Login to continue your journey</p>

                            {apiError && <div className="apiError">{apiError}</div>}

                            <form onSubmit={handleSubmit} className="form" noValidate>
                                <div className="fieldGroup">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`input ${errors.email ? "inputError" : ""}`}
                                    />
                                    {errors.email && (
                                        <span className="errorMsg">{errors.email}</span>
                                    )}
                                </div>

                                <div className="fieldGroup">
                                    <input
                                        type="password"
                                        name="password"
                                        autoComplete="off"
                                        placeholder="Password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className={`input ${errors.password ? "inputError" : ""}`}
                                    />
                                    {errors.password && (
                                        <span className="errorMsg">{errors.password}</span>
                                    )}

                                    <button
                                        type="button"
                                        className="forgotLink"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                    >
                                        {loading ? "Sending OTP..." : "Forgot Password?"}
                                    </button>
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    whileTap={{ scale: loading ? 1 : 0.97 }}
                                    className="button"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
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
                        </>
                    ) : (
                        <>
                            <h1 className="title">Reset Password</h1>
                            <p className="subtitle">Verify OTP to continue</p>

                            {apiError && <div className="apiError">{apiError}</div>}
                            {otpMessage && <div className="successMsg">{otpMessage}</div>}

                            <form onSubmit={handleResetPassword} className="form" noValidate>
                                <div className="fieldGroup">
                                    <input
                                        type="email"
                                        value={form.email}
                                        readOnly
                                        className="input readOnlyInput"
                                    />
                                </div>

                                <div className="fieldGroup">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={handleOtpChange}
                                        readOnly={otpVerified}
                                        className={`input ${otpVerified ? "readOnlyInput" : ""}`}
                                    />
                                    {otpLoading && (
                                        <span className="infoMsg">Validating OTP...</span>
                                    )}
                                </div>

                                {otpVerified && (
                                    <>
                                        <div className="fieldGroup">
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="New Password"
                                                value={resetForm.password}
                                                onChange={handleResetChange}
                                                className={`input ${errors.resetPassword ? "inputError" : ""}`}
                                            />
                                            {errors.resetPassword && (
                                                <span className="errorMsg">{errors.resetPassword}</span>
                                            )}
                                        </div>

                                        <div className="fieldGroup">
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                value={resetForm.confirmPassword}
                                                onChange={handleResetChange}
                                                className={`input ${errors.confirmPassword ? "inputError" : ""}`}
                                            />
                                            {errors.confirmPassword && (
                                                <span className="errorMsg">{errors.confirmPassword}</span>
                                            )}
                                        </div>

                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: resetLoading ? 1 : 1.03 }}
                                            whileTap={{ scale: resetLoading ? 1 : 0.97 }}
                                            className="button"
                                            disabled={resetLoading}
                                        >
                                            {resetLoading ? "Resetting Password..." : "Reset Password"}
                                        </motion.button>
                                    </>
                                )}

                                <motion.button
                                    type="button"
                                    className="forgotBtn"
                                    whileHover={{ scale: 1.03 }}
                                    onClick={() => {
                                        setShowResetScreen(false);
                                        setOtp("");
                                        setOtpVerified(false);
                                        setOtpMessage("");
                                        setApiError("");
                                        setResetForm({
                                            password: "",
                                            confirmPassword: "",
                                        });
                                    }}
                                >
                                    Back to Login
                                </motion.button>
                            </form>
                        </>
                    )}
                </div>

                <div className="right">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="rightTitle">Hello</h2>
                        <p className="rightText">
                            New here? Create an account and explore more.
                        </p>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            className="registerBtn"
                            onClick={() => navigate("/register")}
                        >
                            Register
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

export default Login;