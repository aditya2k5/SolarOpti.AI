import React, {
useMemo,
useState,
useEffect
} from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/SolarOpti-logo.png";

export default function Auth() {


const navigate = useNavigate();

const [mode, setMode] =
    useState("login");

const [email, setEmail] =
    useState("");

const [password, setPassword] =
    useState("");

const [confirmPassword,
    setConfirmPassword] =
    useState("");

const [name, setName] =
    useState("");

const [error, setError] =
    useState("");

// Prevent logged-in users from reopening auth page
useEffect(() => {

    const token =
        localStorage.getItem(
            "token"
        );

    if (token) {

        navigate(
            "/Index",
            {
                replace: true
            }
        );
    }

}, [navigate]);

// Clean toggle helper
const handleModeToggle = (
    targetMode
) => {

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");

    setMode(
        targetMode
    );
};

const title = useMemo(
    () =>
        mode === "login"
            ? "Welcome Back"
            : "Create an Account",
    [mode]
);

const subtitle = useMemo(
    () =>
        mode === "login"
            ? "Sign in to save designs and export reports."
            : "Register to save designs and export reports.",
    [mode]
);

// Email validation
const validateEmail = (
    email
) => {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
};

// Password validation
const validatePassword = (
    password
) => {

    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        .test(password);
};

// Name validation
const validateName = (
    name
) => {

    return /^[A-Za-z ]{3,}$/
        .test(name);
};

// Submit Handler
const onSubmit = async (
    e
) => {

    e.preventDefault();
    setError("");

    if (
        mode === "register"
    ) {

        if (
            !validateName(name)
        ) {

            setError(
                "Name should contain at least 3 letters."
            );
            return;
        }

        if (
            !validateEmail(email)
        ) {

            setError(
                "Please enter a valid email address."
            );
            return;
        }

        if (
            !validatePassword(password)
        ) {

            setError(
                "Password must contain uppercase, lowercase, number, special character and be at least 8 characters."
            );
            return;
        }

        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );
            return;
        }
    }

    try {

        const endpoint =
            mode === "register"
                ? "/api/auth/register"
                : "/api/auth/login";

        const payload =
            mode === "register"
                ? {
                    name,
                    email,
                    password
                }
                : {
                    email,
                    password
                };

        const response =
            await fetch(
                `http://localhost:5000${endpoint}`,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        const data =
            await response.json();

        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Authentication failed"
            );
        }

        // LOGIN
        if (
            mode === "login"
        ) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );

            navigate(
                "/Index",
                {
                    replace:true
                }
            );

        }

        // REGISTER
        else {

            alert(
                "Account created successfully! Please sign in."
            );

            handleModeToggle(
                "login"
            );
        }

    } catch (
        err
    ) {

        console.error(
            "Authentication Error:",
            err.message
        );

        setError(
            err.message
        );
    }
};

return (

    <div className="min-h-screen bg-transparent flex flex-col transition-colors duration-300">

        <div className="flex-1 relative bg-transparent overflow-hidden flex items-center justify-center py-16 px-4">

            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#10B981] opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#34D399] opacity-10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">

                {/* Header */}
                <div className="text-center mb-8">

                    <img
                        src={logo}
                        alt="SolarOpti.AI Logo"
                        className="h-12 w-auto mx-auto mb-4"
                    />

                    <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                        {title}
                    </h1>

                    <p className="mt-3 text-[var(--text-muted)]">
                        {subtitle}
                    </p>

                </div>

                {/* Card */}
                <div className="card p-6 md:p-8 shadow-2xl">

                    <form
                        onSubmit={onSubmit}
                        className="space-y-5"
                    >

                        {/* Name */}
                        {mode === "register" && (

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                placeholder="Name"
                                className="w-full rounded-xl bg-[var(--background)] border border-[var(--border-emerald)] px-4 py-3"
                            />
                        )}

                        {/* Email */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            placeholder="Email"
                            className="w-full rounded-xl bg-[var(--background)] border border-[var(--border-emerald)] px-4 py-3"
                        />

                        {/* Password */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Password"
                            className="w-full rounded-xl bg-[var(--background)] border border-[var(--border-emerald)] px-4 py-3"
                        />

                        {/* Confirm Password */}
                        {mode === "register" && (

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm Password"
                                className="w-full rounded-xl bg-[var(--background)] border border-[var(--border-emerald)] px-4 py-3"
                            />
                        )}

                        {/* Error */}
                        {error && (

                            <p className="text-red-500 text-sm text-center">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-primary w-full"
                        >
                            {
                                mode === "login"
                                    ? "Sign In"
                                    : "Create Account"
                            }
                        </button>

                        {/* Guest */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/Index",
                                    {
                                        replace:false
                                    }
                                )
                            }
                            className="btn-outline w-full py-3"
                        >
                            Continue as Guest
                        </button>

                        {/* Toggle */}
                        <div className="mt-4 text-center text-sm text-[var(--text-muted)]">

                            {
                                mode === "login"
                                    ? (
                                        <p>
                                            Don't have an account?{" "}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleModeToggle(
                                                        "register"
                                                    )
                                                }
                                                className="text-[#10B981] font-semibold"
                                            >
                                                Register here
                                            </button>
                                        </p>
                                    )
                                    : (
                                        <p>
                                            Already have an account?{" "}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleModeToggle(
                                                        "login"
                                                    )
                                                }
                                                className="text-[#10B981] font-semibold"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    )
                            }

                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
);
}


