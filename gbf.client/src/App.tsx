import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage";
import AboutPage from "./Pages/AboutPage";
import LoginPage from "./Pages/LoginPage";
import { CollectionPage } from "./Pages/CollectionPage";
import { RegisterForm } from "./Components/auth/RegisterForm";
export default function App() {
    return (
        <>
            <Navbar />
            <main className="p-4">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/collection" element={<CollectionPage/> }/>
                </Routes>
            </main>
        </>
    );
}
