import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const DishDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [quantity, setQuantity] = useState(1);
    const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentOption, setPaymentOption] = useState('full'); // 'full' or 'advance'

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const fetchDish = async () => {
            try {
                const { data } = await axios.get(`/api/food/${id}`);
                setDish(data);

                // Set initial delivery time to 5 hours from now
                const defaultTime = new Date(Date.now() + 5 * 60 * 60 * 1000);
                defaultTime.setMinutes(defaultTime.getMinutes() - defaultTime.getTimezoneOffset());
                setDeliveryTime(defaultTime.toISOString().slice(0, 16));

                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchDish();
    }, [id]);

    const handleOrder = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'customer') {
            alert('Only customers can place orders.');
            return;
        }

        const selectedTime = new Date(deliveryTime);
        const minTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now

        if (selectedTime < minTime) {
            alert('Orders must be placed at least 4 hours in advance.');
            return;
        }

        const totalPrice = dish.price * quantity;
        const amountPaid = paymentOption === 'advance' ? totalPrice * 0.25 : totalPrice;

        setOrderLoading(true);
        try {
            const orderData = {
                orderItems: [{
                    foodItemId: dish._id,
                    title: dish.title,
                    price: dish.price,
                    quantity: parseInt(quantity)
                }],
                deliveryAddress,
                deliveryTime: selectedTime.toISOString(),
                paymentMethod,
                amountPaid,
                chefId: dish.chefId
            };

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            await axios.post('/api/orders', orderData, config);
            setOrderSuccess(true);
            setOrderLoading(false);
            setTimeout(() => navigate('/customer/orders'), 2000);

        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setOrderLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading dish details...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!dish) return <div className="text-center py-10">Dish not found</div>;

    const totalPrice = dish.price * quantity;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">

                <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 relative">
                    {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={dish.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No Image Available</div>
                    )}
                    {dish.dietType && (
                        <div className={`absolute top-4 right-4 flex items-center justify-center w-8 h-8 bg-white rounded border-2 ${dish.dietType === 'Veg' ? 'border-green-600' : 'border-red-600'}`}>
                            <div className={`w-4 h-4 rounded-full ${dish.dietType === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                    )}
                </div>

                <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{dish.title}</h1>
                                {dish.category && <span className="text-xs font-semibold uppercase text-gray-500">{dish.category}</span>}
                            </div>
                            <span className="text-2xl font-bold text-orange-600">₹{dish.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Prepared by Chef <span className="font-semibold text-gray-700">{dish.chefName}</span></p>
                        <p className="text-gray-700 mb-6">{dish.description}</p>
                    </div>

                    {orderSuccess ? (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
                            Order placed successfully! Redirecting...
                        </div>
                    ) : (
                        <form onSubmit={handleOrder} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    />
                                </div>
                                <div className="w-2/3">
                                    <label className="block text-sm font-medium text-gray-700">Delivery Time (min 4 hrs)</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={deliveryTime}
                                        onChange={(e) => setDeliveryTime(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                                <textarea
                                    required
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    rows="2"
                                    placeholder="Enter your full delivery address"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Payment Option</label>
                                    <select
                                        value={paymentOption}
                                        onChange={(e) => setPaymentOption(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    >
                                        <option value="full">Pay Full (₹{totalPrice.toFixed(2)})</option>
                                        <option value="advance">Pay 25% Advance (₹{(totalPrice * 0.25).toFixed(2)})</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Credit/Debit Card</option>
                                        <option value="Cash">Cash (Balance on Delivery)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 mt-6">
                                <div className="flex justify-between text-lg font-semibold mb-4 text-gray-900">
                                    <span>Amount to Pay Now:</span>
                                    <span className="text-orange-600">₹{paymentOption === 'advance' ? (totalPrice * 0.25).toFixed(2) : totalPrice.toFixed(2)}</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={orderLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400"
                                >
                                    {orderLoading ? 'Processing Checkout...' : 'Confirm Order & Pay'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DishDetails;
