export default function CharacterCounter({ current, max, isDark }: { current: number; max: number; isDark: boolean }) {
    if (current < 100) return null; // show only if >= 100 chars

    const percentage = Math.min((current / max) * 100, 100);
    const remaining = max - current;

    const getColor = () => {
        if (current > max) return "text-red-500 border-red-500";
        if (percentage >= 80) return "text-amber-500 border-amber-500";
        return "text-[#5296dd] border-[#5296dd]";
    };

    return (
        <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Circle progress using conic-gradient */}
            <div
                className={`
                    w-full h-full rounded-full border-2
                    ${getColor()}
                `}
                style={{
                    background: `conic-gradient(currentColor ${percentage}%, transparent ${percentage}%)`
                }}
            />
            <span className={`absolute text-[10px] font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
            </span>
        </div>
    );
}
