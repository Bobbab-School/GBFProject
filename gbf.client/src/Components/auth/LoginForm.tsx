import { useState } from "react";
import { useAuth } from "./AuthContext";

export const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            setError("");
            onSuccess?.();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-black border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black border p-2 rounded"
            />
            <button className="bg-blue-500 text-white p-2 rounded">Sign in</button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
    );
};
