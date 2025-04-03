import React from 'react';
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import { FiHome, FiUpload, FiLogOut, FiHeart } from 'react-icons/fi';

const Layout = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        doSignOut().then(() => {
            navigate('/login');
        });
    };

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-white shadow-md fixed h-full">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-indigo-700">Home Rental</h1>
                    <p className="text-sm text-gray-500">Welcome {currentUser?.email}</p>
                </div>

                <nav className="mt-4 h-[calc(100%-80px)] flex flex-col">
                    <div>
                        <Link
                            to="/home"
                            className={`flex items-center w-full px-4 py-3 ${isActive('/home') ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FiHome className="mr-3" />
                            Dashboard
                        </Link>

                        <Link
                            to="/list-property"
                            className={`flex items-center w-full px-4 py-3 ${isActive('/list-property') ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FiUpload className="mr-3" />
                            List Property
                        </Link>

                        <button
                            onClick={() => navigate('/my-listings')}
                            className={`flex items-center w-full px-4 py-3 ${isActive('/my-listings') ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            My Listings
                        </button>

                        <Link
                            to="/favorites"
                            className={`flex items-center w-full px-4 py-3 ${isActive('/favorites') ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FiHeart className="mr-3" />
                            Favorites
                        </Link>
                    </div>

                    <div className="mt-auto mb-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50"
                        >
                            <FiLogOut className="mr-3" />
                            Logout
                        </button>
                    </div>
                </nav>
            </div>

            <div className="flex-1 ml-64 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;