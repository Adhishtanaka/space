import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ngeohash from "ngeohash";
import { api } from "../lib/api";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";

import MapControls from "../components/MapControls";
import MapView from "../components/MapView";
import type { UserGeo } from "../lib/types";


L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function classNames(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

type TileTheme = "auto" | "light" | "dark";

const SRI_LANKA_CENTER = { lat: 6.9271, lng: 79.8612 };



export default function Home() {
    const { token, user } = useAuth();
    const { isDark } = useTheme();

    const [precision, setPrecision] = useState(5); // 3..8
    const [tileTheme] = useState<TileTheme>("auto");

    const [center, setCenter] = useState<{ lat: number; lng: number }>(SRI_LANKA_CENTER);
    const [hasLocation, setHasLocation] = useState(false); 
    const [geoError, setGeoError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [nearbyUsers, setNearbyUsers] = useState<UserGeo[]>([]);

    useEffect(() => setMounted(true), []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    const updateLocation = () => {
        if (!("geolocation" in navigator)) {
            setGeoError("Geolocation not supported");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCenter({ lat, lng });
                setHasLocation(true); // User has shared location
                setGeoError(null);
                setLoading(false);

                // Update geohash on backend
                if (token) {
                    try {
                        const hash = ngeohash.encode(lat, lng, precision);
                        await api.updateGeohash(hash, token);
                        // Fetch nearby users
                        const users = await api.getNearbyUsers(hash, precision, token);
                        setNearbyUsers(users);
                    } catch (e) {
                        console.warn('Failed to update geohash:', e);
                    }
                }
            },
            (err) => {
                setGeoError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
    };

    // Friends nearby: use real nearby users if available, else empty
    const friends = useMemo(() => {
        if (nearbyUsers && nearbyUsers.length > 0) {
            return nearbyUsers.map((u, i) => {
                const { latitude, longitude } = ngeohash.decode(u.Geohash);

                return {
                    id: u.id || i,
                    name: u.firstName ? `${u.firstName} ${u.lastName || ''}` : `User ${i + 1}`,
                    lat: latitude,
                    lng: longitude,
                };
            });
        }
        return [];
    }, [nearbyUsers]);

    // Update geohash and fetch nearby users when center or precision changes, but only if user has shared location
    useEffect(() => {
        if (hasLocation && center && token) {
            const hash = ngeohash.encode(center.lat, center.lng, precision);
            api.updateGeohash(hash, token)
                .then(() => api.getNearbyUsers(hash, precision, token))
                .then(setNearbyUsers)
                .catch(() => { });
        }
    }, [center, precision, token, hasLocation]);

    const activeTheme: Exclude<TileTheme, "auto"> = useMemo(() => {
        if (tileTheme === "auto") return isDark ? "dark" : "light";
        return tileTheme as Exclude<TileTheme, "auto">;
    }, [tileTheme, isDark]);

    const tileConfig = useMemo(() => {
        const attributions = {
            carto:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
        switch (activeTheme) {
            case "dark":
                return {
                    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    attribution: attributions.carto,
                };
            case "light":
            default:
                return {
                    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                    attribution: attributions.carto,
                };
        }
    }, [activeTheme]);

    const mapRef = useRef<L.Map | null>(null);

    // Recenter map when center changes
    useEffect(() => {
        if (center && mapRef.current) {
            const map = mapRef.current;
            map.setView([center.lat, center.lng], Math.max(map.getZoom(), 13), { animate: true });
        }
    }, [center]);

    return (
        <div className={classNames(
            "min-h-screen transition-colors duration-200",
            isDark ? "bg-black" : "bg-gray-50"
        )}>
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
                <MapControls
                    precision={precision}
                    setPrecision={setPrecision}
                    updateLocation={updateLocation}
                    loading={loading}
                    geoError={geoError}
                    friends={friends}
                    isDark={isDark}
                />
                <MapView
                    mounted={mounted}
                    activeTheme={activeTheme}
                    tileConfig={tileConfig}
                    center={center}
                    mapRef={mapRef}
                    hasLocation={hasLocation}
                    user={user}
                    friends={friends}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}