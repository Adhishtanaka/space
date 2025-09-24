import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import type { FollowUser } from '../lib/types';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: FollowUser[];
  title: string;
  isDark: boolean;
}

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function FollowersModal({ 
  isOpen, 
  onClose, 
  users, 
  title, 
  isDark 
}: FollowersModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
                  "w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all",
                  isDark
                    ? "bg-gray-900 border border-gray-800"
                    : "bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className={classNames(
                      "text-lg font-semibold leading-6",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className={classNames(
                      "rounded-lg p-1.5 transition-colors duration-200",
                      isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-800"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={onClose}
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <UserIcon className={classNames(
                        "size-12 mx-auto mb-4 opacity-50",
                        isDark ? "text-gray-600" : "text-gray-400"
                      )} />
                      <p className={classNames(
                        "text-sm",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        No {title.toLowerCase()} yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={classNames(
                            "flex items-center gap-3 p-3 rounded-xl transition-colors duration-200",
                            isDark
                              ? "hover:bg-gray-800"
                              : "hover:bg-gray-50"
                          )}
                        >
                          {/* Avatar */}
                          <div
                            className={classNames(
                              "size-12 rounded-xl text-white grid place-items-center text-sm font-bold shadow-md flex-shrink-0",
                              user.gender === "F"
                                ? "bg-gradient-to-br from-pink-400 to-pink-600"
                                : "bg-gradient-to-br from-[#5296dd] to-[#92bddf]"
                            )}
                          >
                            {user.firstName?.[0] || <UserIcon className="size-5" />}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <p className={classNames(
                              "text-sm font-medium truncate",
                              isDark ? "text-white" : "text-gray-900"
                            )}>
                              {user.firstName} {user.lastName}
                            </p>
                            <p className={classNames(
                              "text-xs truncate",
                              isDark ? "text-gray-400" : "text-gray-500"
                            )}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className={classNames(
                      "w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}