import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ConfirmDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDark?: boolean;
}

export default function ConfirmDeleteModal({ open, onClose, onConfirm, isDark }: ConfirmDeleteModalProps) {
    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                            className={`w-full max-w-sm rounded-xl p-6 shadow-xl border ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}
                        >
                            <Dialog.Title className="text-lg font-semibold mb-2">Confirm Deletion</Dialog.Title>
                            <Dialog.Description className="mb-4">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </Dialog.Description>
                            <div className="flex justify-end gap-2">
                                <button
                                    className={`px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                    onClick={onConfirm}
                                >
                                    Delete
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
