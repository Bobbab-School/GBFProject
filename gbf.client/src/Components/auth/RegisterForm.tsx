import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const RegisterForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            // Call register API
            const res = await fetch("/api/db/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Registration failed");
            }

            // Automatically log the user in after successful registration
            await login(username, password);

            // Optionally close modal or navigate
            onSuccess?.();
            navigate("/"); // redirect to home
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto mt-10">
            <h2 className="text-xl font-bold">Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border p-2 rounded"
            />
            <button type="submit" className="bg-green-500 text-white rounded p-2">
                Register
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
};
