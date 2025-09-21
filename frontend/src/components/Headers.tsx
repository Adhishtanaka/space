import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
        <Link
          to={user ? "/feed" : "/"}
          className="flex items-center gap-2 font-semibold"
        >
          <div className="h-7 w-7 rounded bg-[#5296dd] text-white grid place-items-center font-bold">
            S
          </div>
          <span className="tracking-tight">Space</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/feed"
            className={classNames(
              "px-2 py-1 rounded hover:bg-[#92bddf]/10",
              location.pathname === "/feed" && "text-[#5296dd] font-medium",
            )}
          >
            Feed
          </Link>
          {user && (
            <Link
              to={`/profile/${user.id}`}
              className={classNames(
                "px-2 py-1 rounded hover:bg-[#92bddf]/10",
                location.pathname?.startsWith("/profile") &&
                  "text-[#5296dd] font-medium",
              )}
            >
              Profile
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-[#92bddf]/10"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded bg-[#5296dd] text-white hover:bg-[#5296dd]/90"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-[#92bddf]/10">
                <div className="size-7 rounded-full bg-[#5296dd] text-white grid place-items-center">
                  {user.firstName?.[0] || <UserIcon className="size-5" />}
                </div>
                <span className="hidden sm:block text-sm">
                  {user.firstName}
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded border border-gray-200 bg-white shadow-lg focus:outline-none">
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate(`/profile/${user.id}`)}
                          className={classNames(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left",
                            active && "bg-[#92bddf]/10 text-[#5296dd]",
                          )}
                        >
                          <UserIcon className="size-4" />
                          Your profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/feed")}
                          className={classNames(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left",
                            active && "bg-[#92bddf]/10 text-[#5296dd]",
                          )}
                        >
                          <HomeIcon className="size-4" />
                          Feed
                        </button>
                      )}
                    </Menu.Item>
                    <div className="my-1 border-t border-gray-200" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={classNames(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-red-600 text-left",
                            active && "bg-red-50",
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
