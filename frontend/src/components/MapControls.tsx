import { Switch } from "@headlessui/react";
import React, { useEffect, useState } from "react";

function classNames(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

interface MapControlsProps {
  updateLocation: () => void;
  loading: boolean;
  geoError: string | null;
  friends: Array<{ id: string | number; name: string; lat: number; lng: number }>;
  isDark: boolean;
  removeLocation?: () => void; 
}

const MapControls: React.FC<MapControlsProps> = ({
  updateLocation,
  removeLocation,
  loading,
  geoError,
  friends,
  isDark
}) => {
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    if (!locationEnabled && removeLocation) {
      removeLocation();
    }
  }, [locationEnabled, removeLocation]);

  // Toggle handler
  const handleToggle = async (enabled: boolean) => {
    setLocationEnabled(enabled);
    if (enabled) {
      updateLocation();
    } else if (removeLocation) {
      removeLocation();
    }
  };

  return (
    <section
      className={classNames(
        "rounded-2xl border p-6 transition-all duration-200 w-full",
        isDark ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm" : "border-gray-200 bg-white"
      )}
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Description */}
        <p
          className={classNames(
            "text-sm transition-colors duration-200",
            isDark ? "text-gray-400" : "text-gray-600"
          )}
        >
          Find friends nearby with location sharing
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <span
            className={classNames(
              "text-sm font-medium",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Location Sharing
          </span>
          <Switch
            checked={locationEnabled}
            onChange={handleToggle}
            disabled={loading}
            className={classNames(
              locationEnabled
                ? "bg-blue-600"
                : isDark
                ? "bg-gray-700"
                : "bg-gray-300",
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className={classNames(
                locationEnabled ? "translate-x-6" : "translate-x-1",
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              )}
            />
          </Switch>
        </div>

        {/* Geo Error Message */}
        {geoError && <p className="text-xs text-red-500">{geoError}</p>}

        {/* Friends Nearby Count */}
        <p
          className={classNames(
            "text-xs transition-colors duration-200",
            isDark ? "text-gray-400" : "text-gray-600"
          )}
        >
          {friends.length} friends nearby
        </p>
      </div>
    </section>
  );
};

export default MapControls;
