import { useTheme } from "../hooks/useTheme";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Footer() {
    const { isDark } = useTheme();
    return (
        <footer
            className={classNames(
                "w-full border-t py-6 text-center text-xs transition-colors duration-200",
                isDark ? "border-gray-800 bg-black/90 text-gray-500" : "border-gray-200 bg-white/90 text-gray-500"
            )}
        >
            <span>
                &copy; {new Date().getFullYear()} Space. Made with <span className="text-[#5296dd]">♥</span>
            </span>
        </footer>
    );
}
