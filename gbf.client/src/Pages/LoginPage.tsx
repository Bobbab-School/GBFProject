import { useAuth } from "../Components/auth/AuthContext";
import { LoginForm } from "../Components/auth/LoginForm";

export default function LoginPage() {
    const { user, logout } = useAuth();
    return user ? (
        <div className="text-center mt-10">
            <p>Welcome, {user.username}</p>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1 mt-2 rounded">
                Logout
            </button>
        </div>
    ) : (
        <LoginForm />
    );
}
