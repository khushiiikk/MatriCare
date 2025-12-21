import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './FindCare.css';

// Fix for default Leaflet marker icons not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coords change
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

const FindCare = () => {
    const { language } = useLanguage();
    const t = translations[language]?.findCare || {
        title: "Find Healthcare",
        subtitle: "Locate nearby ASHA centers and Hospitals",
        locating: "Locating you...",
        permissionDenied: "Location permission denied. Showing default location.",
        error: "Unable to retrieve location.",
        categories: "Emergency Categories",
        asha: "ASHA Center",
        hospital: "HOSPITAL",
        ambulance: "Ambulance",
        pharmacy: "Pharmacy",
        openMaps: "Open in Maps"
    };

    const [position, setPosition] = useState([20.5937, 78.9629]); // Default: India Center
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setLoading(false);
                },
                (err) => {
                    console.error("Location error:", err);
                    setError(t.permissionDenied);
                    setLoading(false);
                }
            );
        } else {
            setError(t.error);
            setLoading(false);
        }
    }, [t]);

    const handleSearch = (query) => {
        // Open native maps with the query near the user's location
        const mapsUrl = `https://www.google.com/maps/search/${query}/@${position[0]},${position[1]},13z`;
        window.open(mapsUrl, '_blank');
    };

    return (
        <div className="find-care-page">
            <div className="find-care-header">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
            </div>

            <div className="find-care-main-content">
                <div className="map-container">
                    {loading ? (
                        <div className="loading-map">
                            <div className="spinner"></div>
                            <p>{t.locating}</p>
                        </div>
                    ) : (
                        <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="leaflet-map">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position}>
                                <Popup>
                                    You are here
                                </Popup>
                            </Marker>
                            <RecenterMap lat={position[0]} lng={position[1]} />
                        </MapContainer>
                    )}
                </div>

                <div className="care-categories">
                    <h2>{t.categories}</h2>
                    <div className="grid-categories">
                        <div className="category-card" onClick={() => handleSearch('ASHA center')}>
                            <div className="cat-icon">👩‍⚕️</div>
                            <h3>{t.asha}</h3>
                            <span className="action-link">{t.openMaps} &rarr;</span>
                        </div>

                        <div className="category-card" onClick={() => handleSearch('Hospital')}>
                            <div className="cat-icon">🏥</div>
                            <h3>{t.hospital}</h3>
                            <span className="action-link">{t.openMaps} &rarr;</span>
                        </div>

                        <div className="category-card" onClick={() => handleSearch('Ambulance Service')}>
                            <div className="cat-icon">🚑</div>
                            <h3>{t.ambulance}</h3>
                            <span className="action-link">{t.openMaps} &rarr;</span>
                        </div>

                        <div className="category-card" onClick={() => handleSearch('Pharmacy')}>
                            <div className="cat-icon">💊</div>
                            <h3>{t.pharmacy}</h3>
                            <span className="action-link">{t.openMaps} &rarr;</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindCare;
