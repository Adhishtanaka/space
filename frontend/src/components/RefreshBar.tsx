import { ArrowPathIcon } from "@heroicons/react/24/solid";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function RefreshNotification({ 
    show, 
    onRefresh, 
    isDark
}: { 
    show: boolean; 
    onRefresh: () => void; 
    isDark: boolean; 
}) {
    if (!show) return null;


    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div 
                className={classNames(
                    "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border cursor-pointer transition-all hover:scale-105",
                    isDark 
                        ? "bg-gray-900 border-gray-700 text-white" 
                        : "bg-white border-gray-200 text-gray-900"
                )}
                onClick={onRefresh}
            >
                <ArrowPathIcon className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium">
                    New posts alert
                </span>
            </div>
        </div>
    );
}