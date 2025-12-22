import React, { useState, useEffect, useCallback } from 'react';
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
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// Red icon for nearby results
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coords change
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 13);
        }
    }, [lat, lng, map]);
    return null;
};

const FindCare = () => {
    const { language } = useLanguage();
    const t = translations[language]?.findCare || translations['en'].findCare;

    const [position, setPosition] = useState([20.5937, 78.9629]); // Default: India Center
    const [userLoc, setUserLoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [nearbyResults, setNearbyResults] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPos);
                    setUserLoc(newPos);
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

    const fetchNearby = async (category) => {
        setSearching(true);
        setActiveCategory(category);

        const [lat, lng] = position;
        const radius = 5000; // 5km

        let query = "";
        switch (category) {
            case 'asha':
                query = `nwr["amenity"~"health|clinic|doctor"](around:${radius},${lat},${lng});`;
                break;
            case 'hospital':
                query = `nwr["amenity"="hospital"](around:${radius},${lat},${lng});`;
                break;
            case 'ambulance':
                query = `nwr["emergency"~"ambulance_station|rescue_station"](around:${radius},${lat},${lng});`;
                break;
            case 'pharmacy':
                query = `nwr["amenity"="pharmacy"](around:${radius},${lat},${lng});`;
                break;
            default:
                break;
        }

        if (!query) return;

        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];${query}out center body;`;

        try {
            const response = await fetch(overpassUrl);
            const data = await response.json();

            const results = data.elements.map(el => ({
                id: el.id,
                lat: el.lat || (el.center ? el.center.lat : null),
                lon: el.lon || (el.center ? el.center.lon : null),
                name: el.tags.name || (category.charAt(0).toUpperCase() + category.slice(1)),
                address: el.tags['addr:street'] || el.tags['addr:city'] || "Nearby location"
            })).filter(res => res.lat && res.lon);

            setNearbyResults(results);
        } catch (err) {
            console.error("Overpass error:", err);
        } finally {
            setSearching(false);
        }
    };

    const handleOpenInMaps = (lat, lon) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        window.open(mapsUrl, '_blank');
    };

    return (
        <div className="find-care-page">
            <div className="container">
                <div className="find-care-header">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>

                <div className="find-care-main-content">
                    <div className="map-container-wrapper">
                        <div className="map-container">
                            {loading ? (
                                <div className="loading-map">
                                    <div className="spinner"></div>
                                    <p>{t.locating}</p>
                                </div>
                            ) : (
                                <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="leaflet-map">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {userLoc && (
                                        <Marker position={userLoc}>
                                            <Popup>
                                                <strong>You are here</strong>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {nearbyResults.map(res => (
                                        <Marker
                                            key={res.id}
                                            position={[res.lat, res.lon]}
                                            icon={redIcon}
                                        >
                                            <Popup>
                                                <div className="map-popup">
                                                    <strong>{res.name}</strong>
                                                    {res.address && <p>{res.address}</p>}
                                                    <button
                                                        className="popup-btn"
                                                        onClick={() => handleOpenInMaps(res.lat, res.lon)}
                                                    >
                                                        {t.openMaps}
                                                    </button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    <RecenterMap lat={position[0]} lng={position[1]} />
                                </MapContainer>
                            )}
                            {searching && <div className="searching-overlay"><div className="spinner-sm"></div> Searching...</div>}
                        </div>
                    </div>

                    <div className="care-categories">
                        <h2>{t.categories}</h2>
                        <div className="grid-categories">
                            <div className={`category-card ${activeCategory === 'asha' ? 'active' : ''}`} onClick={() => fetchNearby('asha')}>
                                <div className="cat-icon">👩‍⚕️</div>
                                <h3>{t.asha}</h3>
                                <span className="action-link">Click to find nearby &rarr;</span>
                            </div>

                            <div className={`category-card ${activeCategory === 'hospital' ? 'active' : ''}`} onClick={() => fetchNearby('hospital')}>
                                <div className="cat-icon">🏥</div>
                                <h3>{t.hospital}</h3>
                                <span className="action-link">Click to find nearby &rarr;</span>
                            </div>

                            <div className={`category-card ${activeCategory === 'ambulance' ? 'active' : ''}`} onClick={() => fetchNearby('ambulance')}>
                                <div className="cat-icon">🚑</div>
                                <h3>{t.ambulance}</h3>
                                <span className="action-link">Click to find nearby &rarr;</span>
                            </div>

                            <div className={`category-card ${activeCategory === 'pharmacy' ? 'active' : ''}`} onClick={() => fetchNearby('pharmacy')}>
                                <div className="cat-icon">💊</div>
                                <h3>{t.pharmacy}</h3>
                                <span className="action-link">Click to find nearby &rarr;</span>
                            </div>
                        </div>

                        {nearbyResults.length > 0 && (
                            <div className="nearby-list-container">
                                <h3>Nearby {activeCategory} Results</h3>
                                <div className="nearby-list">
                                    {nearbyResults.map(res => (
                                        <div key={res.id} className="nearby-item" onClick={() => setPosition([res.lat, res.lon])}>
                                            <div className="nearby-item-info">
                                                <strong>{res.name}</strong>
                                                <span>{res.address || "Area location"}</span>
                                            </div>
                                            <button className="view-on-map-btn" onClick={(e) => { e.stopPropagation(); handleOpenInMaps(res.lat, res.lon); }}>
                                                Maps
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindCare;

