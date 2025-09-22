import { MapPinIcon } from "@heroicons/react/24/outline";
import React from "react";

function classNames(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

interface MapControlsProps {
    precision: number;
    setPrecision: (v: number) => void;
    updateLocation: () => void;
    loading: boolean;
    geoError: string | null;
    friends: Array<{ id: string | number; name: string; lat: number; lng: number }>;
    isDark: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
    precision,
    setPrecision,
    updateLocation,
    loading,
    geoError,
    friends,
    isDark
}) => {
    return (
        <section className={classNames(
            "rounded-2xl border p-6 transition-all duration-200",
            isDark
                ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm"
                : "border-gray-200 bg-white"
        )}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className={classNames(
                        "text-sm transition-colors duration-200",
                        isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                        Find friends nearby with location sharing
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className={classNames(
                            "text-sm font-medium transition-colors duration-200",
                            isDark ? "text-gray-300" : "text-gray-700"
                        )}>
                            Precision Level
                        </span>
                        <span className={classNames(
                            "text-sm transition-colors duration-200",
                            isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                            {precision}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={3}
                        max={8}
                        step={1}
                        value={precision}
                        onChange={(e) => setPrecision(parseInt(e.target.value))}
                        className="w-full accent-[#5296dd]"
                    />
                    <p className={classNames(
                        "text-xs mt-1 transition-colors duration-200",
                        isDark ? "text-gray-500" : "text-gray-500"
                    )}>
                        Lower = broader area, Higher = more precise
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={updateLocation}
                        disabled={loading}
                        className={classNames(
                            "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200",
                            "bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white hover:shadow-lg hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        )}
                    >
                        <MapPinIcon className="size-4" />
                        {loading ? "Updating..." : "Update Location"}
                    </button>
                    {geoError && (
                        <p className="text-xs text-red-500">{geoError}</p>
                    )}
                    <p className={classNames(
                        "text-xs transition-colors duration-200",
                        isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                        {friends.length} friends nearby
                    </p>
                </div>
            </div>
        </section>
    );
};

export default MapControls;
