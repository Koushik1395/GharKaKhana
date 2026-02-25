import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChefDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'listings'

    // New Food Item Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'chef') {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                // Fetch Chef's Orders
                const ordersRes = await axios.get('/api/orders/cheforders', config);
                setOrders(ordersRes.data);

                // Fetch Chef's Food Items (Assuming filtering on frontend or we could create a dedicated backend route. For now, we'll fetch all and filter, though a dedicated route is better)
                const foodRes = await axios.get('/api/food');
                const myFood = foodRes.data.filter(item => item.chefName === user.name); // Using chefName match for now due to formatting
                setFoodItems(myFood);

                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);

            // Update local state
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const newFood = { title, description, price: Number(price), imageUrl };
            const { data } = await axios.post('/api/food', newFood, config);

            // We need to fetch again or just append (re-map it)
            setFoodItems([...foodItems, { ...data, chefName: user.name }]);

            // Clear form
            setTitle(''); setDescription(''); setPrice(''); setImageUrl('');
            alert('Food item added successfully!');

        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Chef Dashboard</h1>
                <div className="mt-4 md:mt-0 flex space-x-4">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-md font-medium ${activeTab === 'orders' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Manage Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-4 py-2 rounded-md font-medium ${activeTab === 'listings' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        My Listings
                    </button>
                </div>
            </div>

            {activeTab === 'orders' && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Incoming Orders</h2>
                    {orders.length === 0 ? (
                        <p className="text-gray-600">No orders yet.</p>
                    ) : (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                                    <div className="flex justify-between border-b pb-4 mb-4">
                                        <div>
                                            <p className="font-bold text-gray-900">Order from: {order.customerName}</p>
                                            <p className="text-sm text-gray-600 mt-1">Delivery to: {order.deliveryAddress}</p>
                                            <p className="text-sm text-gray-500 mt-2">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-orange-600">₹{order.totalPrice.toFixed(2)}</p>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="font-medium text-gray-700 mb-2">Order Items:</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {order.items.map((item, i) => (
                                                <li key={i}>{item.quantity}x {item.title}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {order.status !== 'Completed' && order.status !== 'Rejected' && (
                                        <div className="flex space-x-3 pt-4 border-t">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(order._id, 'Accepted')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">Accept Order</button>
                                                    <button onClick={() => handleStatusUpdate(order._id, 'Rejected')} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium">Reject</button>
                                                </>
                                            )}
                                            {order.status === 'Accepted' && (
                                                <button onClick={() => handleStatusUpdate(order._id, 'Completed')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium">Mark as Completed</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'listings' && (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h2 className="text-xl font-bold mb-4">Add New Food</h2>
                            <form onSubmit={handleAddFood} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="3"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                                    <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-md font-medium hover:bg-orange-700">Add Item</button>
                            </form>
                        </div>
                    </div>

                    <div className="md:w-2/3">
                        <h2 className="text-xl font-bold mb-4">My Listings</h2>
                        {foodItems.length === 0 ? (
                            <p className="text-gray-600">You haven't listed any food yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {foodItems.map(item => (
                                    <div key={item._id} className="bg-white border rounded-lg overflow-hidden flex flex-col">
                                        <div className="h-32 bg-gray-200">
                                            {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-400">No Image</div>}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="font-bold line-clamp-1">{item.title}</h3>
                                                    <span className="font-bold text-orange-600">₹{item.price.toFixed(2)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChefDashboard;
