import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { pagesContent } from '../data/pagesContent';
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
    const { language } = useLanguage();
    const content = pagesContent[language]?.findCare || pagesContent.en.findCare;

    const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError(content.locationError);
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
                setError(content.locationError);
                setLoading(false);
            }
        );
    }, [content.locationError]);

    const categories = [
        {
            id: 'asha',
            name: content.categories.asha,
            query: 'ASHA center',
            img: '/asha-logo.jpg'
        },
        {
            id: 'hospital',
            name: content.categories.hospital,
            query: 'government hospital',
            img: '/hospital-icon.jpg'
        },
        {
            id: 'ambulance',
            name: content.categories.ambulance,
            query: 'ambulance service',
            img: '/ambulance-icon.jpg'
        },
        {
            id: 'pharmacy',
            name: content.categories.pharmacy,
            query: 'pharmacy',
            img: '/pharmacy-icon.jpg'
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
                    <h1>{content.pageTitle}</h1>
                    <p>{content.pageSubtitle}</p>
                </div>

                {/* Side-by-side layout: Map left, Options right */}
                <div className="find-care-layout">
                    {/* Map Section - Left side */}
                    <div className="map-section-left">
                        {loading ? (
                            <div className="map-loader">
                                <div className="loader"></div>
                                <p>{content.mapLoading}</p>
                            </div>
                        ) : (
                            <div className="map-card-wrapper">
                                <MapContainer center={[location.lat, location.lng]} zoom={15} className="leaflet-map-large">
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

                    {/* Emergency Categories Section - Right side, vertical */}
                    <div className="emergency-section-right">
                        <h2 className="section-title-right">{content.pageTitle}</h2>
                        <div className="emergency-grid-vertical">
                            {categories.map((cat) => (
                                <div key={cat.id} className="emergency-card-vertical floating-subtle" onClick={() => openMapsSearch(cat.query)}>
                                    <div className="emergency-icon-box">
                                        <img src={cat.img} alt={cat.name} className="emergency-img" />
                                    </div>
                                    <div className="emergency-card-content">
                                        <h3>{cat.name}</h3>
                                        <div className="open-maps-link">
                                            Open in Maps →
                                        </div>
                                    </div>
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
