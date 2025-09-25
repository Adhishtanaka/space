import React, { lazy } from "react";
import L from "leaflet";
import type { MapViewProps } from "../types/geo";
import { Link } from "react-router";

function classNames(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

const MapContainer = lazy(() => import("react-leaflet").then(m => ({ default: m.MapContainer })));
const TileLayer = lazy(() => import("react-leaflet").then(m => ({ default: m.TileLayer })));
const Marker = lazy(() => import("react-leaflet").then(m => ({ default: m.Marker })));
const Popup = lazy(() => import("react-leaflet").then(m => ({ default: m.Popup })));

const createCustomMarker = (firstLetter: string, gender: string) => {
    const gradient = gender === "F"
        ? "linear-gradient(135deg, #f687b3 0%, #ec4899 100%)" 
        : "linear-gradient(135deg, #5296dd 0%, #92bddf 100%)";  

    const iconHtml = `
        <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${gradient};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
            ${firstLetter || 'U'}
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: '', // Remove default class
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};


const MapView: React.FC<MapViewProps> = ({
    mounted,
    activeTheme,
    tileConfig,
    center,
    mapRef,
    hasLocation,
    user,
    friends,
    isDark
}) => {
    return (
        <section className={classNames(
            "rounded-2xl border overflow-hidden transition-all duration-200",
            isDark
                ? "border-gray-800 bg-gray-900/50"
                : "border-gray-200 bg-white"
        )}>
            <div className="h-96 w-full">
                {mounted && (
                    <MapContainer
                        key={`map-${activeTheme}-${isDark}`}
                        center={[center.lat, center.lng]}
                        zoom={10}
                        style={{ height: "100%", width: "100%" }}
                        ref={mapRef}
                    >
                        <TileLayer
                            key={`tiles-${activeTheme}`}
                            attribution={tileConfig.attribution}
                            url={tileConfig.url}
                        />

                        {/* Your location marker: only show if user has shared location */}
                        {hasLocation && (
                            <Marker
                                position={[center.lat, center.lng]}
                                icon={createCustomMarker(user?.firstName?.[0] || "U" , user?.gender || "M")}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-medium text-[#5296dd]">You are here</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Friends markers */}
                        {friends.map((f) => (
                            <Marker
                                key={f.id}
                                position={[f.lat, f.lng]}
                                icon={createCustomMarker(f.name?.[0] || "U",f.gender)}
                            >
                                <Popup>
                                    <div
                                        className="text-sm cursor-pointer hover:bg-gray-100 rounded transition"
                                    >
                                        <Link to={`/profile/${f.id}`}>
                                        <p className="font-medium">{f.name}</p>
                                        {f.email && <p className="text-xs text-gray-600">{f.email}</p>}
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </section>
    );
};

export default MapView;
