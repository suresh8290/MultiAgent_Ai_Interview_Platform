
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
    FiArrowLeft,
    FiCheck,
    FiCreditCard,
    FiShield,
    FiZap,
    FiDollarSign,
    FiLock,
    FiLoader,
    FiAlertCircle,
    FiCheckCircle,
    FiRefreshCw,
} from "react-icons/fi";

import api from "../utils/axios";

// Available plans
const plans = [
    {
        id: "starter",
        name: "Starter",
        price: 199,
        coins: 300,
        description: "Perfect for starting your interview preparation.",
        features: [
            "300 Interview Coins",
            "AI Mock Interviews",
            "AI Interview Feedback",
            "Resume Analysis",
            "Personalized Learning Roadmap",
        ],
        popular: true,
    },
];

function Billing({ user, setUser }) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [processingPlan, setProcessingPlan] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const currentCoins = user?.interviewCoin ?? 0;

    // Handle payment
    const handlePurchase = async (plan) => {
        if (loading) return;

        setError("");
        setSuccess("");

        // Check Razorpay script
        if (!window.Razorpay) {
            setError(
                "Payment gateway is not loaded. Please refresh the page and try again."
            );
            return;
        }

        // Check Razorpay public key
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            setError("Razorpay configuration is missing.");
            return;
        }

        setLoading(true);
        setProcessingPlan(plan.id);

        try {
            // STEP 1: Create order
            const orderResponse = await api.post(
                "/api/billing/create",
                {
                    planId: plan.id,
                }
            );

            const order = orderResponse.data?.order;

            if (!order?.id) {
                throw new Error("Unable to create payment order.");
            }

            // STEP 2: Configure Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,

                amount: order.amount,
                currency: order.currency,

                name: "Multi AI",
                description: `${plan.name} Plan - ${plan.coins} Interview Coins`,

                order_id: order.id,

                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },

                theme: {
                    color: "#8B5CF6",
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setProcessingPlan(null);
                    },
                },

                // STEP 3: Verify payment on backend
                handler: async (paymentResponse) => {
                    try {
                        const verifyResponse = await api.post(
                            "/api/billing/verify",
                            paymentResponse
                        );

                        console.log(
                            "Payment verification response:",
                            verifyResponse.data
                        );

                        if (!verifyResponse.data?.success) {
                            throw new Error(
                                verifyResponse.data?.message ||
                                "Payment verification failed."
                            );
                        }


                        // STEP 4: Credit coins through Auth Service
                        const coinResponse = await api.post(
                            "/api/auth/add-coins",
                            {
                                coins: plan.coins,
                            }
                        );

                        if (!coinResponse.data?.success) {
                            throw new Error(
                                coinResponse.data?.message ||
                                "Payment successful, but coin crediting failed."
                            );
                        }


                        console.log("Coins credited:", coinResponse.data);

                        // Get updated balance from Auth Service
                        const updatedCoins = Number(
                            coinResponse.data.interviewCoin
                        );

                        if (!Number.isFinite(updatedCoins)) {
                            throw new Error("Invalid coin balance returned by Auth Service");
                        }

                        // Update React user state
                        setUser((previousUser) => ({
                            ...previousUser,
                            interviewCoin: updatedCoins,
                        }));

                        console.log("Updated coin balance:", updatedCoins);

                        setSuccess(
                            `${plan.coins} interview coins have been added successfully!`
                        );


                        setLoading(false);
                        setProcessingPlan(null);

                        window.alert(
                            `Payment successful!\n\n${plan.coins} interview coins added to your account.`
                        );

                        navigate("/dashboard");

                    } catch (verificationError) {
                        console.error(
                            "Payment verification error:",
                            verificationError
                        );

                        setError(
                            verificationError.response?.data?.message ||
                            verificationError.message ||
                            "Payment verification failed. If money was deducted, please contact support with your payment ID."
                        );

                        setLoading(false);
                        setProcessingPlan(null);
                    }
                },
            };

            // STEP 5: Open Razorpay checkout
            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                console.error("Payment failed:", response.error);

                setError(
                    response.error?.description ||
                    "Your payment failed. Please try again."
                );

                setLoading(false);
                setProcessingPlan(null);
            });

            razorpay.open();

        } catch (purchaseError) {
            console.error("Purchase error:", purchaseError);

            setError(
                purchaseError.response?.data?.message ||
                purchaseError.message ||
                "Something went wrong. Please try again."
            );

            setLoading(false);
            setProcessingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#08080D] text-white overflow-hidden">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-150px] left-[20%] w-[400px] h-[400px] bg-purple-600/10 blur-[150px] rounded-full" />

                <div className="absolute bottom-[-150px] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* NAVBAR */}
                <header className="h-20 flex items-center justify-between border-b border-white/5">

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                    >
                        <FiArrowLeft size={18} />

                        <span className="text-sm font-medium">
                            Dashboard
                        </span>
                    </button>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiShield className="text-green-400" />

                        <span>Secure Payment</span>
                    </div>

                </header>

                {/* MAIN CONTENT */}
                <main className="py-12 sm:py-16">

                    {/* HERO SECTION */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-2xl mx-auto"
                    >

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-6">
                            <FiZap />

                            Upgrade Your Preparation
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                            Invest in your
                            <span className="text-purple-400"> career.</span>
                        </h1>

                        <p className="text-gray-400 text-sm sm:text-base mt-5 leading-relaxed">
                            Get more interview coins and unlock powerful AI tools
                            to prepare for your next job opportunity.
                        </p>

                    </motion.div>

                    {/* COIN BALANCE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="max-w-md mx-auto mt-12"
                    >

                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#191528] to-[#11111B] p-6 sm:p-7">

                            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />

                            <div className="relative flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-400">
                                        Available Coin Balance
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">

                                        <FiDollarSign className="text-yellow-400 text-3xl" />

                                        <span className="text-4xl font-bold tracking-tight">
                                            {currentCoins}
                                        </span>

                                        <span className="text-sm text-gray-500">
                                            Coins
                                        </span>

                                    </div>

                                </div>

                                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">

                                    <FiZap className="text-purple-400 text-2xl" />

                                </div>

                            </div>

                        </div>

                    </motion.div>

                    {/* PRICING HEADING */}
                    <div className="text-center mt-16 mb-10">

                        <h2 className="text-2xl sm:text-3xl font-bold">
                            Choose Your Plan
                        </h2>

                        <p className="text-gray-500 text-sm mt-3">
                            Simple pricing. No hidden charges.
                        </p>

                    </div>

                    {/* PRICING CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

                        {plans.map((plan, index) => (

                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.12,
                                }}
                                className="relative rounded-3xl border border-purple-500/30 bg-[#12121C] p-6 sm:p-8 shadow-[0_0_50px_rgba(139,92,246,0.07)]"
                            >

                                {/* POPULAR LABEL */}
                                {plan.popular && (

                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold whitespace-nowrap">
                                        Most Popular
                                    </div>

                                )}

                                {/* PLAN TITLE */}
                                <div className="flex items-center justify-between mt-2">

                                    <div>

                                        <h3 className="text-xl font-bold">
                                            {plan.name}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-2">
                                            {plan.description}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">

                                        <FiZap className="text-purple-400 text-xl" />

                                    </div>

                                </div>

                                {/* PRICE */}
                                <div className="mt-8 flex items-end gap-2">

                                    <span className="text-4xl font-bold">
                                        ₹{plan.price}
                                    </span>

                                    <span className="text-gray-500 text-sm mb-1">
                                        / one-time
                                    </span>

                                </div>

                                {/* COINS */}
                                <div className="mt-7 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5 flex items-center justify-between">

                                    <div>

                                        <p className="text-xs text-gray-400">
                                            You will receive
                                        </p>

                                        <h4 className="text-2xl font-bold text-purple-300 mt-2">
                                            {plan.coins} Coins
                                        </h4>

                                    </div>

                                    <FiDollarSign className="text-yellow-400 text-3xl" />

                                </div>

                                {/* FEATURES */}
                                <div className="mt-8">

                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-5">
                                        What's included
                                    </p>

                                    <div className="space-y-4">

                                        {plan.features.map((feature) => (

                                            <div
                                                key={feature}
                                                className="flex items-center gap-3 text-sm text-gray-300"
                                            >

                                                <span className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">

                                                    <FiCheck className="text-green-400 text-xs" />

                                                </span>

                                                {feature}

                                            </div>

                                        ))}

                                    </div>

                                </div>

                                {/* BUY BUTTON */}
                                <button
                                    onClick={() => handlePurchase(plan)}
                                    disabled={loading}
                                    className="w-full mt-9 py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-purple-500/20"
                                >

                                    {loading && processingPlan === plan.id ? (

                                        <>
                                            <FiLoader className="animate-spin" />

                                            Processing...
                                        </>

                                    ) : (

                                        <>
                                            <FiCreditCard />

                                            Buy Now — ₹{plan.price}
                                        </>

                                    )}

                                </button>

                                {/* SECURE PAYMENT */}
                                <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-500">

                                    <FiLock />

                                    Secured by Razorpay

                                </div>

                            </motion.div>

                        ))}

                    </div>

                    {/* ERROR MESSAGE */}
                    {error && (

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-md mx-auto mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3"
                        >

                            <FiAlertCircle className="text-red-400 mt-0.5 shrink-0" />

                            <div>

                                <p className="text-sm font-semibold text-red-300">
                                    Payment Error
                                </p>

                                <p className="text-xs text-red-300/80 mt-1">
                                    {error}
                                </p>

                                <button
                                    onClick={() => setError("")}
                                    className="text-xs text-red-300 underline mt-3"
                                >
                                    Dismiss
                                </button>

                            </div>

                        </motion.div>

                    )}

                    {/* SUCCESS MESSAGE */}
                    {success && (

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-md mx-auto mt-8 rounded-xl border border-green-500/20 bg-green-500/10 p-4 flex items-start gap-3"
                        >

                            <FiCheckCircle className="text-green-400 mt-0.5 shrink-0" />

                            <div>

                                <p className="text-sm font-semibold text-green-300">
                                    Payment Successful
                                </p>

                                <p className="text-xs text-green-300/80 mt-1">
                                    {success}
                                </p>

                            </div>

                        </motion.div>

                    )}

                    {/* SECURITY INFORMATION */}
                    <div className="max-w-2xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">

                        <div>

                            <FiShield className="mx-auto text-green-400 text-2xl mb-3" />

                            <p className="text-sm font-medium">
                                Secure Payments
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Powered by Razorpay
                            </p>

                        </div>

                        <div>

                            <FiLock className="mx-auto text-purple-400 text-2xl mb-3" />

                            <p className="text-sm font-medium">
                                Protected Checkout
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Secure payment verification
                            </p>

                        </div>

                        <div>

                            <FiRefreshCw className="mx-auto text-blue-400 text-2xl mb-3" />

                            <p className="text-sm font-medium">
                                Instant Credit
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Coins added after verification
                            </p>

                        </div>

                    </div>

                </main>

                {/* FOOTER */}
                <footer className="border-t border-white/5 py-7 text-center">

                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} Multi AI. All rights reserved.
                    </p>

                </footer>

            </div>

        </div>
    );
}

export default Billing;
