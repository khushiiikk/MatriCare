import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './FindCare.css';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to update map view
const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView([coords.lat, coords.lng], 15);
        }
    }, [coords, map]);
    return null;
};

const FindCare = () => {
    const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                setError("Unable to retrieve your location. Showing default.");
                setLoading(false);
            }
        );
    }, []);

    const categories = [
        {
            id: 'asha',
            name: 'ASHA Center',
            icon: '👩‍⚕️',
            query: 'ASHA center',
            img: '/care-icon.png'
        },
        {
            id: 'hospital',
            name: 'Govt Hospital',
            icon: '🏥',
            query: 'government hospital',
            img: '/care-icon.png'
        },
        {
            id: 'ambulance',
            name: 'Ambulance',
            icon: '🚑',
            query: 'ambulance service',
            img: '/care-icon.png' // Use generated care icon for now
        },
        {
            id: 'pharmacy',
            name: 'Pharmacy',
            icon: '💊',
            query: 'pharmacy',
            img: '/pharmacy-icon.png' // Placeholder, will use generated icons later
        }
    ];

    const openMapsSearch = (query) => {
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}+near+me/@${location.lat},${location.lng},15z`;
        window.open(mapsUrl, '_blank');
    };

    return (
        <div className="find-care-container">
            <div className="container">
                <div className="find-care-header">
                    <h1>Find Healthcare</h1>
                    <p>Locate nearby ASHA centers and Hospitals instantly</p>
                </div>

                <div className="find-care-layout">
                    {/* Map Section */}
                    <div className="map-section">
                        {loading ? (
                            <div className="map-loader">
                                <div className="loader"></div>
                                <p>Finding your location...</p>
                            </div>
                        ) : (
                            <div className="map-wrapper">
                                <MapContainer center={[location.lat, location.lng]} zoom={15} className="leaflet-map">
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <Marker position={[location.lat, location.lng]}>
                                        <Popup>Your current location</Popup>
                                    </Marker>
                                    <RecenterMap coords={location} />
                                </MapContainer>
                            </div>
                        )}
                        {error && <p className="location-error">{error}</p>}
                    </div>

                    {/* Vertical Sidebar Section */}
                    <div className="categories-sidebar">
                        <h2 className="sidebar-title">Emergency Categories</h2>
                        <div className="categories-vertical-grid">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="care-category-card"
                                    onClick={() => openMapsSearch(cat.query)}
                                >
                                    <div className="cat-card-img-wrapper">
                                        <img src={cat.img} alt={cat.name} className="cat-card-img" />
                                    </div>
                                    <div className="cat-card-info">
                                        <h3>{cat.name}</h3>
                                        <p>Find nearby {cat.name.toLowerCase()} services</p>
                                    </div>
                                    <div className="cat-card-arrow">→</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindCare;
