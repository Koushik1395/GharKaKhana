import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDiet, setSelectedDiet] = useState('All');
    const [sortBy, setSortBy] = useState('Default');

    const { user } = useContext(AuthContext);

    const categories = ['All', 'North Indian', 'South Indian', 'Snacks', 'Tiffins'];
    const dietTypes = ['All', 'Veg', 'Non-Veg'];
    const sortOptions = ['Default', 'Price: Low to High', 'Price: High to Low', 'Name (A-Z)'];

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const { data } = await axios.get('/api/food');
                setFoodItems(data);
                setFilteredItems(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchFoodItems();
    }, []);

    useEffect(() => {
        let items = [...foodItems];
        if (selectedCategory !== 'All') {
            items = items.filter(item => item.category === selectedCategory);
        }
        if (selectedDiet !== 'All') {
            items = items.filter(item => item.dietType === selectedDiet);
        }

        switch (sortBy) {
            case 'Price: Low to High':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'Price: High to Low':
                items.sort((a, b) => b.price - a.price);
                break;
            case 'Name (A-Z)':
                items.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                break;
        }

        setFilteredItems(items);
    }, [selectedCategory, selectedDiet, sortBy, foodItems]);


    if (loading) return <div className="text-center py-10">Loading food items...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Available Home-Cooked Meals</h1>
                {user && user.role === 'chef' && (
                    <Link to="/chef/dashboard" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                        Go to Chef Dashboard
                    </Link>
                )}
            </div>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-semibold text-gray-700">Category:</span>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-orange-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center md:ml-4">
                        <span className="font-semibold text-gray-700">Type:</span>
                        {dietTypes.map(diet => (
                            <button
                                key={diet}
                                onClick={() => setSelectedDiet(diet)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${selectedDiet === diet ? (diet === 'Veg' ? 'border-green-600 text-green-700 bg-green-50' : diet === 'Non-Veg' ? 'border-red-600 text-red-700 bg-red-50' : 'border-gray-600 text-gray-700 bg-gray-50') : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {diet}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 whitespace-nowrap">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white"
                    >
                        {sortOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 border border-gray-100">
                    <p className="text-lg">No food items found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 duration-200 flex flex-col">
                            <div className="h-48 bg-gray-200 relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                {item.dietType && (
                                    <div className={`absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-white rounded shadow-sm border ${item.dietType === 'Veg' ? 'border-green-600' : 'border-red-600'}`}>
                                        <div className={`w-3 h-3 rounded-full ${item.dietType === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </div>
                                )}
                                {item.category && (
                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded shadow-sm font-medium">
                                        {item.category}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-grow pr-2">{item.title}</h3>
                                    <span className="text-orange-600 font-bold whitespace-nowrap">₹{item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">By Chef {item.chefName}</p>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{item.description}</p>
                                <div className="mt-auto">
                                    <Link
                                        to={`/dish/${item._id}`}
                                        className="block w-full text-center bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded-md font-medium hover:bg-orange-600 hover:text-white transition-colors"
                                    >
                                        View Details & Order
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
