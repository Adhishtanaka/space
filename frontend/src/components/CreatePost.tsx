import { useState } from "react";
import { SparklesIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import DOMPurify from "dompurify";
import { api } from "../lib/api";
import type { CreatePostProps } from "../lib/types";
import CharacterCounter from "./CharacterCounter";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

function sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
}


export default function CreatePost({ token, isDark, onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [posting, setPosting] = useState(false);

    const MAX_CHARACTERS = 500;
    const characterCount = content.length;
    const isOverLimit = characterCount > MAX_CHARACTERS;

    function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const rawValue = e.target.value;

        // auto-resize but stop at maxHeight
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;

        if (rawValue.length <= MAX_CHARACTERS || rawValue.length < content.length) {
            setContent(rawValue);
            if (error && rawValue.length <= MAX_CHARACTERS) {
                setError(null);
            }
        }
    }



    async function submitPost(e: React.FormEvent) {
        e.preventDefault();
        if (!token || !content.trim() || isOverLimit) return;

        setPosting(true);
        setError(null);

        try {
            const sanitizedContent = sanitizeInput(content.trim());
            const newPost = await api.createPost(sanitizedContent, token);
            setContent("");
            onPostCreated(newPost);
        } catch (err: unknown) {
            setError((err as Error)?.message || "Could not create post");
        } finally {
            setPosting(false);
        }
    }

    return (
        <section
            className={classNames(
                "rounded-2xl border p-6 transition-all duration-200 shadow-sm",
                isDark
                    ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm"
                    : "border-gray-200 bg-white"
            )}
        >
            <div className="space-y-4">
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Share what's on your mind..."
                        style={{ overflow: "hidden", maxHeight: "300px" }}
                        className={classNames(
                            "w-full min-h-24 rounded-xl border px-4 py-3 outline-none transition-all duration-200 resize-none",
                            "focus:ring-2 focus:border-[#5296dd]",
                            isOverLimit
                                ? "focus:ring-red-500 border-red-500"
                                : "focus:ring-[#5296dd]",
                            isDark
                                ? classNames(
                                    "bg-gray-800 text-gray-100 placeholder-gray-400",
                                    isOverLimit ? "border-red-500" : "border-gray-700"
                                )
                                : classNames(
                                    "bg-white text-gray-900 placeholder-gray-500",
                                    isOverLimit ? "border-red-500" : "border-gray-300"
                                )
                        )}
                    />



                    {isOverLimit && (
                        <div className="absolute top-2 right-2">
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-md">
                                Character limit exceeded
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <SparklesIcon className="size-4" />
                            <span>Share your thoughts with the Space community</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <CharacterCounter
                            current={characterCount}
                            max={MAX_CHARACTERS}
                            isDark={isDark}
                        />

                        <button
                            onClick={submitPost}
                            disabled={posting || !content.trim() || isOverLimit}
                            className={classNames(
                                "inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium",
                                "bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white",
                                "hover:shadow-lg hover:scale-105 transition-all duration-200",
                                "disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                            )}
                        >
                            <PaperAirplaneIcon className="size-4" />
                            {posting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
