import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import {
    HandThumbUpIcon as HandThumbUpOutline,
    HandThumbDownIcon as HandThumbDownOutline,
    EllipsisHorizontalIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import type { PostProps } from "../types/post";
import { api } from "../lib/api";
import Linkify from "linkify-react";
import { useMemo, useState, useCallback, memo } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import VotesModal from "./VotesModal";
import '@mariusbongarts/previewbox/dist';
import { Link } from "react-router";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

function PostComponent({
    post,
    token,
    isDark,
    isOwner = false,
    onVoteChange,
    onPostUpdate,
    onPostDelete
}: PostProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showMenu, setShowMenu] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVotesModal, setShowVotesModal] = useState(false);

    const handleVote = useCallback(async (isUp: boolean) => {
        if (!token) return;

        const already = post.currentUserVote;
        let up = post.upVotes;
        let down = post.downVotes;
        let current = post.currentUserVote as boolean | null;

        if (current === null) {
            if (isUp) up++;
            else down++;
            current = isUp;
        } else if (current === isUp) {
            if (isUp) up--;
            else down--;
            current = null;
        } else {
            if (isUp) {
                up++;
                down--;
            } else {
                down++;
                up--;
            }
            current = isUp;
        }

        // Optimistic update
        onVoteChange({
            ...post,
            upVotes: up,
            downVotes: down,
            totalScore: up - down,
            currentUserVote: current,
        });

        try {
            if (already === isUp) {
                await api.removeVote(post.id, token);
            } else {
                await api.vote(post.id, isUp, token);
            }
        } catch {
            // Revert on error
            try {
                const data = await api.getFeed(token);
                const freshPost = data.find((p) => p.id === post.id);
                if (freshPost) {
                    onVoteChange(freshPost);
                }
            } catch {
                // If we can't revert, just refresh the original state
                onVoteChange(post);
            }
        }
    }, [post, token, onVoteChange]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
        setShowMenu(false);
        setEditContent(post.content);
    }, [post.content]);

    const handleSaveEdit = useCallback(async () => {
        if (!token || editContent.trim() === post.content.trim()) {
            setIsEditing(false);
            return;
        }

        setIsUpdating(true);
        try {
            // Use the api.updatePost method
            const updatedPost = await api.updatePost(post.id, editContent.trim(), token);
            onPostUpdate?.(updatedPost);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update post:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsUpdating(false);
        }
    }, [token, editContent, post, onPostUpdate]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditContent(post.content);
    }, [post.content]);

    const handleDelete = useCallback(async () => {
        if (!token) {
            setShowMenu(false);
            return;
        }
        setIsDeleting(true);
        try {
            await api.deletePost(post.id, token);
            onPostDelete?.(post.id);
        } catch (error) {
            console.error('Failed to delete post:', error);
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
            setShowDeleteModal(false);
        }
    }, [token, post.id, onPostDelete]);

    // Extract URLs for preview and embed
    const urls = useMemo(() => {
        const content = isEditing ? editContent : post.content;
        const regex = /(https?:\/\/[^\s]+)/g;
        const matches = content.match(regex) || [];
        return matches
            .map(url => url.replace(/[.,!?)]*$/, ""))
            .filter(url => url && /^https?:\/\//.test(url));
    }, [post.content, editContent, isEditing]);

    // Helper to render embedded content for supported URLs
    const renderEmbed = (url: string) => {
        // YouTube
        const ytMatch = url.match(
            /(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/))([\w-]{11})/
        );
        if (ytMatch) {
            return (
                <div className="my-2">
                    <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }
        // Twitter
        const twMatch = url.match(/https?:\/\/(?:www\.)?twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
        if (twMatch) {
            return (
                <blockquote className="twitter-tweet">
                    <a href={url}>{url}</a>
                </blockquote>
            );
        }
        return null;
    };

    return (
        <article
            className={classNames(
                "rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg relative",
                isDark
                    ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm"
                    : "border-gray-200 bg-white"
            )}
        >
            {/* Post Header */}
            <div className="mb-4 flex items-center gap-3">
                <div
                    className={classNames(
                        "size-10 rounded-full text-white grid place-items-center font-medium",
                        post.userGender === "F"
                            ? "bg-gradient-to-br from-pink-400 to-pink-600"
                            : "bg-gradient-to-br from-[#5296dd] to-[#92bddf]"
                    )}
                >
                    {post.userFirstName?.[0] || "?"}
                </div>

                <div className="flex-1">
                    <Link to={`/profile/${post.userId}`} style={{ textDecoration: 'none' }}>
                        <div
                            className={classNames(
                                "font-medium transition-colors duration-200",
                                isDark ? "text-gray-200" : "text-gray-900"
                            )}
                        >
                            {post.userFirstName} {post.userLastName}
                        </div>
                    </Link>
                    <div className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                    </div>
                </div>

                {/* Options Menu for Owner */}
                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={classNames(
                                "p-2 rounded-lg transition-colors duration-200",
                                isDark
                                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <EllipsisHorizontalIcon className="size-5" />
                        </button>

                        {showMenu && (
                            <div
                                className={classNames(
                                    "absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-10",
                                    isDark
                                        ? "bg-gray-800 border-gray-700"
                                        : "bg-white border-gray-200"
                                )}
                            >
                                <button
                                    onClick={handleEdit}
                                    className={classNames(
                                        "w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-opacity-75 transition-colors",
                                        isDark
                                            ? "text-gray-200 hover:bg-gray-700"
                                            : "text-gray-900 hover:bg-gray-100"
                                    )}
                                >
                                    <PencilIcon className="size-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => { setShowDeleteModal(true); setShowMenu(false); }}
                                    disabled={isDeleting}
                                    className={classNames(
                                        "w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50",
                                        isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"
                                    )}
                                >
                                    <TrashIcon className="size-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content (no embeds here) */}
            {isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={classNames(
                            "w-full p-3 rounded-lg border resize-none focus:ring-2 focus:ring-[#5296dd] focus:border-transparent",
                            isDark
                                ? "bg-gray-800 border-gray-700 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                        )}
                        rows={4}
                        placeholder="What's on your mind?"
                    />
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleSaveEdit}
                            disabled={isUpdating || editContent.trim() === ''}
                            className="px-4 py-2 bg-[#5296dd] text-white rounded-lg hover:bg-[#4285cc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className={classNames(
                                "px-4 py-2 rounded-lg border transition-colors disabled:opacity-50",
                                isDark
                                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={classNames(
                        "whitespace-pre-wrap text-[15px] leading-relaxed mb-4 transition-colors duration-200",
                        isDark ? "text-gray-200" : "text-gray-900"
                    )}
                >
                    <Linkify
                        options={{
                            defaultProtocol: "https",
                            className: "underline text-blue-600 hover:text-blue-800",
                            nl2br: true,
                        }}
                    >
                        {post.content}
                    </Linkify>
                </div>
            )}

            {/* Embedded content (YouTube/Twitter) below post, only once per unique URL */}
            {!isEditing && urls.length > 0 && (
                <div className="space-y-3 mb-4">
                    {[...new Set(urls)]
                        .map((url) => {
                            const embed = renderEmbed(url);
                            return embed ? <div key={url}>{embed}</div> : null;
                        })}
                </div>
            )}

            {/* URL Previews (exclude YouTube links) below embeds */}
            {!isEditing && urls.length > 0 && (
                <div className="space-y-3 mb-4">
                    {urls
                        .filter(url => !/^(https?:\/\/(www\.|m\.)?(youtube\.com\/watch\?v=|youtu\.be\/))/.test(url))
                        .map((url) => {
                            const previewBoxStyle = isDark
                                ? '--pb-background-color: #111827; --pb-text-color: #fff; --pb-text-color-light: #e5e7eb;'
                                : '--pb-background-color: #fff; --pb-text-color: #111827; --pb-text-color-light: #374151;';
                            return (
                                <div
                                    key={url}
                                    className="rounded-lg overflow-hidden border"
                                    dangerouslySetInnerHTML={{
                                        __html: `<previewbox-link href="${url}" style="${previewBoxStyle}"></previewbox-link>`
                                    }}
                                />
                            );
                        })}
                </div>
            )}

            {/* Post Actions */}
            {!isEditing && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleVote(true)}
                            className={classNames(
                                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                post.currentUserVote === true
                                    ? "text-[#5296dd] bg-[#5296dd]/10"
                                    : isDark
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                        >
                            {post.currentUserVote === true ? (
                                <HandThumbUpIcon className="size-4" />
                            ) : (
                                <HandThumbUpOutline className="size-4" />
                            )}
                            {post.upVotes}
                        </button>

                        <button
                            onClick={() => handleVote(false)}
                            className={classNames(
                                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                post.currentUserVote === false
                                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                    : isDark
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                        >
                            {post.currentUserVote === false ? (
                                <HandThumbDownIcon className="size-4" />
                            ) : (
                                <HandThumbDownOutline className="size-4" />
                            )}
                            {post.downVotes}
                        </button>
                    </div>

                    {/* Show votes button - only show if there are votes */}
                    {(post.upVotes > 0 || post.downVotes > 0) && (
                        <button
                            onClick={() => setShowVotesModal(true)}
                            className={classNames(
                                "text-xs px-3 py-1.5 rounded-full transition-colors font-medium",
                                isDark
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {post.upVotes + post.downVotes} {post.upVotes + post.downVotes === 1 ? 'vote' : 'votes'}
                        </button>
                    )}
                </div>
            )}

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowMenu(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                isDark={isDark}
            />

            {/* Votes Modal */}
            {token && (
                <VotesModal
                    isOpen={showVotesModal}
                    onClose={() => setShowVotesModal(false)}
                    postId={post.id}
                    token={token}
                    isDark={isDark}
                />
            )}
        </article>
    );
}

// Custom comparison for memoization: only re-render if post.id, content, votes, or owner/token changes
function areEqual(prevProps: PostProps, nextProps: PostProps) {
    return (
        prevProps.post.id === nextProps.post.id &&
        prevProps.post.content === nextProps.post.content &&
        prevProps.post.upVotes === nextProps.post.upVotes &&
        prevProps.post.downVotes === nextProps.post.downVotes &&
        prevProps.post.currentUserVote === nextProps.post.currentUserVote &&
        prevProps.token === nextProps.token &&
        prevProps.isDark === nextProps.isDark &&
        prevProps.isOwner === nextProps.isOwner
    );
}

export default memo(PostComponent, areEqual);