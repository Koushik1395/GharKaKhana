import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md w-full sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl text-orange-600">HomeBite</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-gray-700 font-medium">Hi, {user.name}</span>
                                {user.role === 'admin' ? (
                                    <Link to="/admin/dashboard" className="text-gray-600 hover:text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-md">Admin Area</Link>
                                ) : user.role === 'chef' ? (
                                    <Link to="/chef/dashboard" className="text-gray-600 hover:text-orange-600">Dashboard</Link>
                                ) : (
                                    <Link to="/customer/orders" className="text-gray-600 hover:text-orange-600">My Orders</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
