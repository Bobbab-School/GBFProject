import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { LoginForm } from "./auth/LoginForm";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <nav className="bg-purple-950 text-white flex justify-between p-3">
            <div className="flex gap-4">
                <Link to="/" className="hover:text-blue-400">Home</Link>
                <Link to="/about" className="hover:text-blue-400">About</Link>
                <Link to="collection" className="hover:text-blue-400">Collection</Link>
            </div>

            <div>
                {!user ? (
                    <button onClick={() => setShowLogin(true)} className="bg-fuchsia-900 px-3 py-1 rounded">
                        Login
                    </button>
                ) : (
                    <div className="relative">
                        <button onClick={() => setShowProfile(!showProfile)}>{user.username}</button>
                        {showProfile && (
                            <div className="absolute right-0 mt-2 bg-white text-black p-2 rounded shadow">
                                <button onClick={logout} className="text-red-500">Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showLogin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded shadow-md relative">
                        <button
                            className="absolute top-2 right-3 text-gray-500"
                            onClick={() => setShowLogin(false)}
                        >
                            ✖
                        </button>
                        <LoginForm onSuccess={() => setShowLogin(false)} />
                        <p className="mt-2 text-sm">
                            Don’t have an account?{" "}
                            <Link to="/register" className="text-blue-500" onClick={() => setShowLogin(false)}>
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </nav>
    );
}
