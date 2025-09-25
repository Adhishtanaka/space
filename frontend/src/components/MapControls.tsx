import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import type { MapControlsProps } from "../types/geo";

function classNames(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const MapControls: React.FC<MapControlsProps> = ({
  updateLocation,
  loading,
  geoError,
  friends,
  isDark
}) => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShareLocationClick = () => {
    if (!locationEnabled) {
      setIsModalOpen(true);
    }
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    setLocationEnabled(true);
    updateLocation();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <section
        className={classNames(
          "rounded-lg border p-4 transition-all duration-200 w-full z-30 relative",
          isDark ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm" : "border-gray-200 bg-white/90 backdrop-blur-sm"
        )}
      >
        <div className="flex flex-col gap-3 w-full">
          {/* Description */}
          <p
            className={classNames(
              "text-xs transition-colors duration-200",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            Find friends nearby
          </p>

          {/* Share Location Button */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleShareLocationClick}
              disabled={loading || locationEnabled}
              className={classNames(
                "w-full py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200",
                locationEnabled
                  ? isDark
                    ? "bg-green-900/50 text-green-400 border border-green-800"
                    : "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white border border-transparent shadow-sm",
                loading && "opacity-50 cursor-not-allowed",
                !locationEnabled && !loading && "hover:shadow-md hover:scale-[1.02]"
              )}
            >
              {loading
                ? "Updating..."
                : locationEnabled
                ? "✓ Shared"
                : "Share Location"}
            </button>

            {locationEnabled && (
              <p
                className={classNames(
                  "text-xs text-center",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Location shared
              </p>
            )}
          </div>

          {/* Geo Error Message */}
          {geoError && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
              {geoError}
            </p>
          )}

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

      {/* Confirmation Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCancel}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={classNames(
                    "w-full max-w-sm transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all border backdrop-blur-sm",
                    isDark 
                      ? "bg-gray-900/95 border-gray-800" 
                      : "bg-white/95 border-gray-200"
                  )}
                >
                  <Dialog.Title
                    as="h3"
                    className={classNames(
                      "text-lg font-semibold leading-6 mb-4 bg-gradient-to-r from-[#5296dd] to-[#92bddf] bg-clip-text text-transparent"
                    )}
                  >
                    Share Your Location
                  </Dialog.Title>

                  <div className="mb-6">
                    <p
                      className={classNames(
                        "text-sm mb-4",
                        isDark ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      To see your friends' locations, your location will be shared with them.
                    </p>
                    
                    <div
                      className={classNames(
                        "p-4 rounded-xl border-l-4",
                        "border-gradient-to-br border-l-[#5296dd]",
                        isDark ? "bg-blue-900/20" : "bg-blue-50/80"
                      )}
                    >
                      <p
                        className={classNames(
                          "text-sm font-medium mb-2",
                          "text-[#5296dd]"
                        )}
                      >
                        Important:
                      </p>
                      <ul
                        className={classNames(
                          "text-sm space-y-1",
                          isDark ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        <li>• Your location will be updated and shared</li>
                        <li>• You cannot delete your location once shared</li>
                        <li>• Only proceed if you accept these terms</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={classNames(
                        "flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-200 border",
                        isDark
                          ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700 border-gray-700"
                          : "bg-gray-100/80 text-gray-700 hover:bg-gray-200 border-gray-300"
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="flex-1 bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white py-2.5 px-4 text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      I Accept
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MapControls;