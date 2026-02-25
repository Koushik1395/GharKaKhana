import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('South Indian');
    const [dietType, setDietType] = useState('Veg');

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchFoodItems();
    }, [user, navigate]);

    const fetchFoodItems = async () => {
        try {
            const { data } = await axios.get('/api/food');
            setFoodItems(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const foodData = { title, description, price: Number(price), imageUrl, category, dietType };

            if (editingId) {
                await axios.put(`/api/food/${editingId}`, foodData, config);
                alert('Food item updated successfully!');
            } else {
                await axios.post('/api/food', foodData, config);
                alert('Food item added successfully!');
            }

            // Reset form
            setEditingId(null);
            setTitle(''); setDescription(''); setPrice(''); setImageUrl(''); setCategory('South Indian'); setDietType('Veg');

            fetchFoodItems();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setPrice(item.price);
        setImageUrl(item.imageUrl);
        setCategory(item.category || 'South Indian');
        setDietType(item.dietType || 'Veg');
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.delete(`/api/food/${id}`, config);
            fetchFoodItems();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle(''); setDescription(''); setPrice(''); setImageUrl(''); setCategory('South Indian'); setDietType('Veg');
    };

    if (loading) return <div className="text-center py-10">Loading Admin Dashboard...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard - Menu Management</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Form Section */}
                <div className="md:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Food Item' : 'Add New Food Item'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="3"></textarea>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Category Section</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="South Indian">South Indian</option>
                                        <option value="North Indian">North Indian</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Tiffins">Tiffins</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Diet Type</label>
                                    <select value={dietType} onChange={(e) => setDietType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="Veg">Veg</option>
                                        <option value="Non-Veg">Non-Veg</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-orange-600 text-white flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-orange-700">
                                    {editingId ? 'Update Item' : 'Add Item'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-300">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="md:w-2/3">
                    <h2 className="text-xl font-bold mb-4">All Managed Items ({foodItems.length})</h2>
                    <div className="space-y-4">
                        {foodItems.map(item => (
                            <div key={item._id} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row gap-4 shadow-sm items-center">
                                <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover rounded-md" /> : <div className="h-full flex items-center justify-center text-gray-400 text-xs text-center">No Image</div>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold">{item.category}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${item.dietType === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.dietType}</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-orange-600 text-lg">₹{item.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex sm:flex-col gap-2">
                                    <button onClick={() => handleEdit(item)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-blue-200">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-200">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
