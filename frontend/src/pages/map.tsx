import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ngeohash from "ngeohash";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

import MapControls from "../components/MapControls";
import MapView from "../components/MapView";
import type { UserGeo } from "../types/geo";


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
                setHasLocation(true);
                setGeoError(null);
                setLoading(false);
                if (token) {
                    try {
                        const hash = ngeohash.encode(lat, lng);
                        const users = await api.updateGeoAndgetNearby(hash, token);
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

    const friends = useMemo(() => {
        if (nearbyUsers && nearbyUsers.length > 0) {
            return nearbyUsers
                .filter(u => {
                    const gh = u.geohash;
                    return typeof gh === 'string' && gh.length > 0;
                })
                .map((u, i) => {
                    const gh = u.geohash;
                    const { latitude, longitude } = ngeohash.decode(gh as string);

                    return {
                        id: u.id || i,
                        name: u.firstName ? `${u.firstName} ${u.lastName || ''}` : `User ${i + 1}`,
                        email: u.email,
                        lat: latitude,
                        lng: longitude,
                        gender: u.gender
                    };
                });
        }
        return [];
    }, [nearbyUsers]);


    useEffect(() => {
        if (hasLocation && center && token) {
            const hash = ngeohash.encode(center.lat, center.lng);
            api.updateGeoAndgetNearby(hash, token)
                .then(setNearbyUsers)
                .catch(() => { });
        }
    }, [center, token, hasLocation]);

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