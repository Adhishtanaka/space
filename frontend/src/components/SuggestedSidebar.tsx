import { UsersIcon } from "@heroicons/react/24/solid";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import type { FollowUser } from "../lib/types";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

interface SuggestedSidebarProps {
    showSuggested: boolean;
    setShowSuggested: (show: boolean) => void;
    suggested: FollowUser[];
    isDark: boolean;
}

export default function SuggestedSidebar({
    showSuggested,
    setShowSuggested,
    suggested,
    isDark,
}: SuggestedSidebarProps) {
    return (
        <aside
            className={classNames(
                "flex-shrink-0 transition-all duration-300",
                showSuggested ? "w-full md:w-80" : "w-auto"
            )}
        >
            <div className="sticky top-8">
                {!showSuggested ? (
                    <div className="absolute top-0 -left-16 z-10">
                        <button
                            onClick={() => setShowSuggested(true)}
                            className={classNames(
                                "rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl",
                                isDark
                                    ? "bg-gray-900/80 text-gray-200 hover:bg-gray-800 border border-gray-700"
                                    : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                            )}
                            title="Show Suggested Users"
                        >
                            <UsersIcon className="size-5" />
                        </button>
                    </div>
                ) : (
                    <div
                        className={classNames(
                            "w-full rounded-2xl border p-6 transition-all duration-300 transform animate-in slide-in-from-right-4",
                            isDark
                                ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl"
                                : "border-gray-200 bg-white shadow-xl"
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2
                                className={classNames(
                                    "text-lg font-semibold flex items-center gap-2",
                                    isDark ? "text-white" : "text-gray-900"
                                )}
                            >
                                <UsersIcon className="size-5 text-[#5296dd]" />
                                Suggested Users
                            </h2>
                            <button
                                onClick={() => setShowSuggested(false)}
                                className={classNames(
                                    "rounded-full p-1.5 transition-all duration-200",
                                    isDark
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                )}
                                title="Hide Suggested Users"
                            >
                                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {suggested.length === 0 ? (
                            <div
                                className={classNames(
                                    "text-sm text-center py-8",
                                    isDark ? "text-gray-400" : "text-gray-500"
                                )}
                            >
                                <UsersIcon className="size-8 mx-auto mb-2 opacity-30" />
                                No suggestions available
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {suggested.map((user) => (
                                    <li key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors duration-150">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white flex items-center justify-center font-medium text-sm shadow-lg">
                                            {user.firstName?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className={classNames(
                                                    "font-medium text-sm truncate",
                                                    isDark ? "text-gray-200" : "text-gray-900"
                                                )}
                                            >
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {user.email}
                                            </div>
                                        </div>
                                        <button
                                            className={classNames(
                                                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                                                "bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white hover:shadow-lg hover:scale-105 active:scale-95"
                                            )}
                                            disabled
                                        >
                                            <UserPlusIcon className="size-3.5" />
                                            Follow
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
