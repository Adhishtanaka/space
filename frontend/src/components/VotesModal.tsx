import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import type { PostVoteDto, VotesModalProps } from '../lib/types';

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function VotesModal({ isOpen, onClose, postId, token, isDark }: VotesModalProps) {
    const [votes, setVotes] = useState<PostVoteDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upVotes = votes.filter(vote => vote.voteType === 'UpVote');
    const downVotes = votes.filter(vote => vote.voteType === 'DownVote');

    useEffect(() => {
        if (isOpen && postId) {
            fetchVotes();
        }
    }, [isOpen, postId]);

    const fetchVotes = async () => {
        if (!token) return;
        
        setLoading(true);
        setError(null);
        try {
            const votesData = await api.getPostVotes(postId, token);
            setVotes(votesData);
        } catch (err) {
            setError('Failed to load votes');
            console.error('Error fetching votes:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderVotesList = (votesList: PostVoteDto[], voteType: 'UpVote' | 'DownVote') => (
        <div className="space-y-3">
            {votesList.length === 0 ? (
                <div className={classNames(
                    "text-center py-8 text-sm",
                    isDark ? "text-gray-400" : "text-gray-500"
                )}>
                    No {voteType.toLowerCase()}s yet
                </div>
            ) : (
                votesList.map((vote, index) => (
                    <div
                        key={`${vote.userEmail}-${index}`}
                        className={classNames(
                            "flex items-center gap-3 p-3 rounded-lg transition-colors",
                            isDark 
                                ? "hover:bg-gray-800/50" 
                                : "hover:bg-gray-50"
                        )}
                    >
                        {/* Avatar */}
                        <div
                            className={classNames(
                                "size-10 rounded-full text-white grid place-items-center font-medium text-sm",
                                vote.userGender === "F"
                                    ? "bg-gradient-to-br from-pink-400 to-pink-600"
                                    : "bg-gradient-to-br from-[#5296dd] to-[#92bddf]"
                            )}
                        >
                            {vote.userFirstName?.[0] || "?"}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className={classNames(
                                "font-medium text-sm truncate",
                                isDark ? "text-gray-200" : "text-gray-900"
                            )}>
                                {vote.userFirstName} {vote.userLastName}
                            </div>
                            <div className={classNames(
                                "text-xs truncate",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )}>
                                {vote.userEmail}
                            </div>
                        </div>

                        {/* Vote Icon */}
                        <div className={classNames(
                            "p-1.5 rounded-full",
                            voteType === 'UpVote'
                                ? "bg-[#5296dd]/10 text-[#5296dd]"
                                : "bg-red-500/10 text-red-500"
                        )}>
                            {voteType === 'UpVote' ? (
                                <HandThumbUpIcon className="size-4" />
                            ) : (
                                <HandThumbDownIcon className="size-4" />
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                            <Dialog.Panel className={classNames(
                                "w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all",
                                isDark 
                                    ? "bg-gray-900 border border-gray-800" 
                                    : "bg-white"
                            )}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title className={classNames(
                                        "text-lg font-medium",
                                        isDark ? "text-gray-200" : "text-gray-900"
                                    )}>
                                        Votes
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className={classNames(
                                            "p-2 rounded-lg transition-colors",
                                            isDark
                                                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                                                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        <XMarkIcon className="size-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className={classNames(
                                            "animate-spin rounded-full h-6 w-6 border-2 border-t-transparent",
                                            isDark ? "border-gray-400" : "border-gray-600"
                                        )} />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <div className="text-red-500 text-sm">{error}</div>
                                        <button
                                            onClick={fetchVotes}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : (
                                    <Tab.Group>
                                        <Tab.List className={classNames(
                                            "flex space-x-1 rounded-xl p-1 mb-4",
                                            isDark ? "bg-gray-800/50" : "bg-gray-100"
                                        )}>
                                            <Tab className={({ selected }) => classNames(
                                                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
                                                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                                                selected
                                                    ? isDark
                                                        ? "bg-gray-700 text-white shadow"
                                                        : "bg-white text-blue-700 shadow"
                                                    : isDark
                                                        ? "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                                                        : "text-gray-600 hover:bg-white/[0.12] hover:text-blue-600"
                                            )}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <HandThumbUpIcon className="size-4" />
                                                    <span>Upvotes ({upVotes.length})</span>
                                                </div>
                                            </Tab>
                                            <Tab className={({ selected }) => classNames(
                                                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
                                                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                                                selected
                                                    ? isDark
                                                        ? "bg-gray-700 text-white shadow"
                                                        : "bg-white text-red-700 shadow"
                                                    : isDark
                                                        ? "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                                                        : "text-gray-600 hover:bg-white/[0.12] hover:text-red-600"
                                            )}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <HandThumbDownIcon className="size-4" />
                                                    <span>Downvotes ({downVotes.length})</span>
                                                </div>
                                            </Tab>
                                        </Tab.List>
                                        <Tab.Panels className="max-h-80 overflow-y-auto">
                                            <Tab.Panel>
                                                {renderVotesList(upVotes, 'UpVote')}
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                {renderVotesList(downVotes, 'DownVote')}
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}