import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  MoonIcon,
  SunIcon,
  MapIcon
} from "@heroicons/react/24/outline";

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className={classNames(
      "sticky top-0 z-50 border-b backdrop-blur-lg transition-colors duration-200",
      isDark
        ? "border-gray-800 bg-black/90"
        : "border-gray-200 bg-white/90"
    )}>
      <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={user ? "/feed" : "/"}
          className="flex items-center gap-3 font-bold text-lg group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white grid place-items-center font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            S
          </div>
          <span className={classNames(
            "tracking-tight transition-colors duration-200",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Space
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/feed"
            className={classNames(
              "px-4 py-2 rounded-lg transition-all duration-200 font-medium",
              location.pathname === "/feed"
                ? "text-[#5296dd] bg-[#5296dd]/10"
                : isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Feed
          </Link>
          {user && (
            <Link
              to={`/profile/${user.id}`}
              className={classNames(
                "px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                location.pathname?.startsWith("/profile")
                  ? "text-[#5296dd] bg-[#5296dd]/10"
                  : isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              Profile
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={classNames(
              "p-2 rounded-lg transition-all duration-200",
              isDark
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            {isDark ? (
              <SunIcon className="size-5" />
            ) : (
              <MoonIcon className="size-5" />
            )}
          </button>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={classNames(
                  "px-4 py-2 rounded-lg border transition-all duration-200 font-medium",
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                )}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <Menu as="div" className="relative">
              <Menu.Button className={classNames(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200",
                isDark
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              )}>
                <div className="size-8 rounded-full bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white grid place-items-center font-medium text-sm">
                  {user.firstName?.[0] || <UserIcon className="size-4" />}
                </div>
                <span className={classNames(
                  "hidden sm:block text-sm font-medium transition-colors duration-200",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  {user.firstName}
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className={classNames(
                  "absolute right-0 mt-2 w-48 origin-top-right rounded-xl border shadow-xl focus:outline-none",
                  isDark
                    ? "border-gray-800 bg-gray-900"
                    : "border-gray-200 bg-white"
                )}>
                  <div className="p-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/map")}
                          className={classNames(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150",
                            active
                              ? "bg-[#5296dd]/10 text-[#5296dd]"
                              : isDark
                                ? "text-gray-300 hover:bg-gray-800"
                                : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <MapIcon className="size-4" />
                          Map
                        </button>
                      )}
                    </Menu.Item>
                    <div className={classNames(
                      "my-2 border-t",
                      isDark ? "border-gray-800" : "border-gray-200"
                    )} />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={classNames(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 text-left transition-all duration-150",
                            active && "bg-red-50 dark:bg-red-900/20"
                          )}
                        >
                          <ArrowRightStartOnRectangleIcon className="size-4" />
                          Log out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
    </header>
  );
}