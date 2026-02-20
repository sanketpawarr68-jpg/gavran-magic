
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useUser } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config';

// Fix for Leaflet default icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Explicitly define icon options to ensure visibility
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to fit map bounds safely
function ChangeView({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0 && map) {
            try {
                map.fitBounds(bounds, { padding: [50, 50] });
            } catch (e) {
                console.warn("Map bounds error:", e);
            }
        }
    }, [bounds, map]);
    return null;
}

export default function Tracking() {
    const { id } = useParams();
    const { user, isSignedIn } = useUser();
    const [orderId, setOrderId] = useState(id || '');
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Recent Orders for logged in users
    const [recentOrders, setRecentOrders] = useState([]);

    // Map States
    const [userLocation, setUserLocation] = useState(null);
    const [route, setRoute] = useState(null);
    const [mapError, setMapError] = useState(null);
    const [estimatedDelivery, setEstimatedDelivery] = useState(null);

    // Cancel Order State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);


    // Fixed Source: Shrigonda, Maharashtra 413701
    // Approx Coords: 18.6186, 74.6975
    const sourcePosition = [18.6186, 74.6975];

    const navigate = useNavigate();
    const steps = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered'];

    const getCurrentStep = (status) => {
        if (!status) return -1;
        if (status === 'Cancelled') return -1;
        return steps.indexOf(status) !== -1 ? steps.indexOf(status) : 0;
    };

    useEffect(() => {
        if (id) {
            setOrderId(id);
            fetchOrder(id);
        }
    }, [id]);

    // Fetch Recent Orders for Logged-in Users
    useEffect(() => {
        if (isSignedIn && user) {
            const fetchRecentOrders = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/orders/user/${user.id}`);
                    if (Array.isArray(response.data)) {
                        setRecentOrders(response.data);
                    }
                } catch (e) {
                    console.error("Failed to fetch recent orders", e);
                }
            };
            fetchRecentOrders();
        }
    }, [isSignedIn, user]);

    const fetchOrder = async (oid) => {
        setLoading(true);
        setError(null);
        setOrderStatus(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/${oid}`);
            if (response.data) {
                setOrderStatus(response.data);
                // Calculate estimated delivery: Created Date + 3 days (mock logic)
                if (response.data.created_at) {
                    const createdDate = new Date(response.data.created_at);
                    const deliveryDate = new Date(createdDate);
                    deliveryDate.setDate(createdDate.getDate() + 4); // 4 days delivery time
                    setEstimatedDelivery(deliveryDate.toDateString());
                } else {
                    // Fallback if no date
                    const today = new Date();
                    today.setDate(today.getDate() + 4);
                    setEstimatedDelivery(today.toDateString());
                }
            } else {
                setError("Empty response from server");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || 'Order not found. Please check your ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason) {
            alert("Please select a reason for cancellation.");
            return;
        }

        setCancelling(true);
        setCancelling(true);
        try {
            await axios.post(`${API_BASE_URL}/api/orders/${orderStatus._id}/cancel`, {
                reason: cancelReason
            });
            setShowCancelModal(false);
            // Refresh Order Data
            fetchOrder(orderStatus._id);
            alert("Order cancelled successfully.");
        } catch (error) {
            console.error("Cancellation Error:", error);
            alert(error.response?.data?.message || "Failed to cancel order.");
        } finally {
            setCancelling(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (orderId.trim()) {
            navigate(`/tracking/${orderId.trim()}`);
            handleGetUserLocation(); // Auto-trigger location on search
        }
    };

    // Get User Location Handler
    const handleGetUserLocation = () => {
        if (!navigator.geolocation) {
            setMapError('Geolocation is not supported by your browser.');
            return;
        }

        setMapError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);

                // Fetch OSRM Route (Driving)
                // OSRM expects: {lon},{lat};{lon},{lat}
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sourcePosition[1]},${sourcePosition[0]};${longitude},${latitude}?overview=full&geometries=geojson`;

                try {
                    const response = await axios.get(osrmUrl);
                    if (response.data.routes && response.data.routes.length > 0) {
                        const geometry = response.data.routes[0].geometry;
                        // OSRM returns [lon, lat], Leaflet needs [lat, lon]
                        const latLngs = geometry.coordinates.map(coord => [coord[1], coord[0]]);
                        setRoute(latLngs);
                    } else {
                        // Fallback to straight line
                        setRoute([sourcePosition, [latitude, longitude]]);
                    }
                } catch (e) {
                    console.error("Routing Error:", e);
                    // Fallback to straight line
                    setRoute([sourcePosition, [latitude, longitude]]);
                }
            },
            () => {
                setMapError('Unable to retrieve your location. Please allow location access.');
            }
        );
    };

    // Format Date Helper
    const formatDate = (dateString) => {
        if (!dateString) return "Date unavailable";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Recent Order" : date.toLocaleDateString();
    };

    const currentStep = orderStatus ? getCurrentStep(orderStatus.order_status) : 0;

    return (
        <main className="container" style={{ padding: '80px 0', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{
                    width: '80px', height: '80px', background: '#e1f5fe', color: 'var(--secondary)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '2rem'
                }}>
                    <i className="fas fa-truck-moving"></i>
                </div>
                <h1 className="section-title" style={{ margin: '0 0 10px' }}>Track Your Order</h1>
                <p style={{ color: '#777' }}>Enter your order ID or select from your recent orders.</p>
            </div>

            <div className="tracking-box">
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <input
                        type="text"
                        className="tracking-input"
                        placeholder="e.g., ORD-123456"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        style={{ flex: 1, padding: '15px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }}
                    />
                    <button type="submit" className="btn" style={{ padding: '0 40px' }} disabled={loading}>
                        {loading ? 'Searching...' : 'Track'}
                    </button>
                </form>

                {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

                {/* --- Recent Orders List (Only if logged in and looking at search) --- */}
                {!orderStatus && isSignedIn && recentOrders.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h4 style={{ marginBottom: '15px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Your Recent Orders</h4>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {recentOrders.map(order => (
                                <div
                                    key={order._id}
                                    onClick={() => navigate(`/tracking/${order._id}`)}
                                    style={{
                                        padding: '20px', background: 'white', border: '1px solid #eee', borderRadius: '8px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        transition: 'all 0.2s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                    }}
                                    className="hover-lift"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                                            fontSize: '1.2rem'
                                        }}>
                                            <i className="fas fa-box-open"></i>
                                        </div>
                                        <div>
                                            <strong style={{ display: 'block', color: 'var(--dark)' }}>Order #{order._id.slice(-6).toUpperCase()}</strong>
                                            <span style={{ fontSize: '0.85rem', color: '#888' }}>Placed on {formatDate(order.created_at)}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                            background: order.order_status === 'Delivered' ? '#e8f5e9' : '#e3f2fd',
                                            color: order.order_status === 'Delivered' ? '#2e7d32' : '#1565c0'
                                        }}>
                                            {order.order_status}
                                        </span>
                                        <div style={{ marginTop: '5px', fontWeight: 'bold', color: 'var(--dark)' }}>₹{order.total_price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {orderStatus && (
                    <div className="tracking-result">

                        {/* Cancellation Modal */}
                        {showCancelModal && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
                                    <h3 style={{ marginTop: 0 }}>Cancel Order?</h3>
                                    <p style={{ color: '#666' }}>We're sorry you want to cancel. Please tell us why:</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                        {['Found a better price', 'Ordered by mistake', 'Delivery time is too long', 'Changed my mind', 'Other'].map(r => (
                                            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input
                                                    type="radio" name="cancelReason" value={r}
                                                    checked={cancelReason === r}
                                                    onChange={(e) => setCancelReason(e.target.value)}
                                                />
                                                <span>{r}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button
                                            onClick={() => setShowCancelModal(false)}
                                            style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Keep Order
                                        </button>
                                        <button
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                            style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        {orderStatus.order_status !== 'Cancelled' ? (
                            <div className="status-timeline" style={{ position: 'relative', marginBottom: '50px' }}>
                                <div style={{ position: 'absolute', top: '15px', left: '0', height: '4px', width: '100%', background: '#eee', zIndex: 0, borderRadius: '4px' }}></div>
                                <div style={{
                                    position: 'absolute', top: '15px', left: '0', height: '4px',
                                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                                    background: 'var(--secondary)', zIndex: 0, transition: 'all 0.5s ease', borderRadius: '4px'
                                }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                    {steps.map((step, index) => (
                                        <div key={step} style={{ textAlign: 'center', minWidth: '80px' }}>
                                            <div style={{
                                                width: '34px', height: '34px', borderRadius: '50%', margin: '0 auto 10px',
                                                background: index <= currentStep ? 'var(--secondary)' : 'white',
                                                color: index <= currentStep ? 'white' : '#ccc',
                                                border: `4px solid ${index <= currentStep ? 'var(--secondary)' : '#f0f0f0'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'all 0.3s ease'
                                            }}>
                                                {index < currentStep ? <i className="fas fa-check" style={{ fontSize: '0.8rem' }}></i> : <span style={{ fontSize: '0.9rem' }}>{index + 1}</span>}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: index <= currentStep ? 'var(--dark)' : '#aaa', fontWeight: index === currentStep ? '700' : '500' }}>{step}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-error" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span><i className="fas fa-times-circle"></i> This Order has been Cancelled.</span>
                                {orderStatus.cancellation_reason && (
                                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Reason: {orderStatus.cancellation_reason}</span>
                                )}
                            </div>
                        )}

                        {/* Estimated Delivery Banner */}
                        {estimatedDelivery && orderStatus.order_status !== 'Cancelled' && orderStatus.order_status !== 'Delivered' && (
                            <div style={{
                                background: '#e3f2fd', color: '#0d47a1', padding: '15px', borderRadius: '8px',
                                fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <i className="fas fa-calendar-alt"></i>
                                <span>Estimated Delivery: {estimatedDelivery} by 8:00 PM</span>
                            </div>
                        )}

                        {/* --- Live Map Section --- */}
                        <div style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0 }}>Live Shipment Tracking</h4>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!userLocation && (
                                        <button
                                            onClick={handleGetUserLocation}
                                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            <i className="fas fa-location-arrow"></i> Show My Location
                                        </button>
                                    )}
                                </div>
                            </div>

                            {mapError && <div style={{ padding: '10px', background: '#fff3cd', color: '#856404', fontSize: '0.9rem' }}>{mapError}</div>}

                            <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                                <MapContainer
                                    key={orderStatus._id || 'map'}
                                    center={sourcePosition}
                                    zoom={7}
                                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />

                                    {/* Source Marker: Shrigonda */}
                                    <Marker position={sourcePosition}>
                                        <Popup>
                                            <strong>Source: Gavran Magic</strong><br />
                                            Shrigonda, Maharashtra 413701
                                        </Popup>
                                    </Marker>

                                    {/* User Marker: Destination */}
                                    {userLocation && (
                                        <Marker position={userLocation}>
                                            <Popup>
                                                <strong>Destination</strong><br />
                                                Your Location
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Polyline Route from OSRM */}
                                    {route && <Polyline positions={route} color="blue" />}

                                    {/* Auto-fit bounds */}
                                    {route && <ChangeView bounds={route} />}
                                </MapContainer>

                                {!userLocation && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                    }}>
                                        <p style={{ fontWeight: '600', color: '#555', marginBottom: '10px' }}>Enable location to see delivery route</p>
                                        <button onClick={handleGetUserLocation} className="btn">
                                            Allow Location Access
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Details with Cancel Button at Bottom Right */}
                        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Order ID</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ margin: '5px 0' }}>{orderStatus._id || orderId}</h3>
                                        <span style={{ background: '#f0f0f0', color: '#555', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {orderStatus.order_status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Total Amount</small>
                                    <h3 style={{ margin: '5px 0', color: 'var(--primary)' }}>₹{orderStatus.total_price}</h3>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '15px' }}>Items in Shipment</h4>
                                <ul style={{ padding: 0 }}>
                                    {orderStatus.products && orderStatus.products.length > 0 ? (
                                        orderStatus.products.map((p, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f9f9f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '50px', height: '50px', background: '#f9f9f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                        <i className="fas fa-box"></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--dark)' }}>Product {p.product_id ? (typeof p.product_id === 'string' ? `#${p.product_id.slice(-6)}` : '#ID') : ''}</div>
                                                        <small style={{ color: '#999' }}>Quantity: {p.quantity}</small>
                                                    </div>
                                                </div>
                                                <span style={{ fontWeight: '600' }}>₹{(p.price || 0) * (p.quantity || 1)}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li>No items found</li>
                                    )}
                                </ul>
                            </div>

                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #eee', color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <i className="fas fa-map-marker-alt" style={{ marginTop: '3px', color: 'var(--secondary)' }}></i>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--dark)' }}>Delivery Address</strong>
                                        {orderStatus.address}, {orderStatus.city} - {orderStatus.pincode}
                                    </div>
                                </div>

                                {orderStatus.order_status !== 'Delivered' && orderStatus.order_status !== 'Cancelled' && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        style={{
                                            background: 'white', color: '#e74c3c', border: '1px solid #e74c3c',
                                            padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem',
                                            alignSelf: 'center'
                                        }}
                                        className="btn-outline-danger"
                                    >
                                        <i className="fas fa-times-circle"></i> Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
