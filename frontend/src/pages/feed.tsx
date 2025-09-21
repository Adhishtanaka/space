import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";
import { api } from "../lib/api";
import type { Post } from "../lib/types";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { HandThumbUpIcon as HandThumbUpOutline, HandThumbDownIcon as HandThumbDownOutline } from "@heroicons/react/24/outline";

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Feed() {
  const { token, loading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [feed, setFeed] = useState<Post[]>([]);
  const authed = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (!loading && !authed) navigate("/login", { replace: true });
  }, [authed, loading, navigate]);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const data = await api.getFeed(token);
        setFeed(data);
      } catch {
        // ignore for now
      }
    }
    load();
  }, [token]);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const newPost = await api.createPost(content.trim(), token);
      setContent("");
      setFeed((f) => [newPost, ...f]);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Could not create post");
    } finally {
      setPosting(false);
    }
  }

  async function handleVote(p: Post, isUp: boolean) {
    if (!token) return;
    const already = p.currentUserVote;
    
    // Optimistic update
    setFeed((items) =>
      items.map((i) => {
        if (i.id !== p.id) return i;
        let up = i.upVotes;
        let down = i.downVotes;
        let current = i.currentUserVote as boolean | null;
        
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
        
        return {
          ...i,
          upVotes: up,
          downVotes: down,
          totalScore: up - down,
          currentUserVote: current,
        };
      }),
    );

    try {
      if (already === isUp) {
        await api.removeVote(p.id, token);
      } else {
        await api.vote(p.id, isUp, token);
      }
    } catch {
      // Reload on error
      const data = await api.getFeed(token);
      setFeed(data);
    }
  }

  return (
    <div className={classNames(
      "min-h-screen transition-colors duration-200",
      isDark ? "bg-black" : "bg-gray-50"
    )}>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Create Post */}
        <section className={classNames(
          "rounded-2xl border p-6 transition-all duration-200 shadow-sm",
          isDark 
            ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm" 
            : "border-gray-200 bg-white"
        )}>
          <form onSubmit={submitPost} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what's on your mind..."
              className={classNames(
                "w-full min-h-24 rounded-xl border px-4 py-3 outline-none transition-all duration-200 resize-none",
                "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                isDark 
                  ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400" 
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              )}
            />
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <SparklesIcon className="size-4" />
                <span>Share your thoughts with the Space community</span>
              </div>
              <button
                disabled={posting || !content.trim()}
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
          </form>
        </section>

        {/* Feed */}
        <section className="space-y-4">
          {feed.length === 0 ? (
            <div className={classNames(
              "text-center py-12 rounded-2xl border transition-colors duration-200",
              isDark 
                ? "border-gray-800 bg-gray-900/30 text-gray-400" 
                : "border-gray-200 bg-white text-gray-500"
            )}>
              <SparklesIcon className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-sm">Follow people or create your first post to get started.</p>
            </div>
          ) : (
            feed.map((p) => (
              <article
                key={p.id}
                className={classNames(
                  "rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg",
                  isDark 
                    ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm" 
                    : "border-gray-200 bg-white"
                )}
              >
                {/* Post Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white grid place-items-center font-medium">
                    {p.userFirstName?.[0] || "?"}
                  </div>
                  <div>
                    <div className={classNames(
                      "font-medium transition-colors duration-200",
                      isDark ? "text-gray-200" : "text-gray-900"
                    )}>
                      {p.userFirstName} {p.userLastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className={classNames(
                  "whitespace-pre-wrap text-[15px] leading-relaxed mb-4 transition-colors duration-200",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  {p.content}
                </p>

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleVote(p, true)}
                    className={classNames(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      p.currentUserVote === true
                        ? "text-[#5296dd] bg-[#5296dd]/10"
                        : isDark 
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {p.currentUserVote === true ? (
                      <HandThumbUpIcon className="size-4" />
                    ) : (
                      <HandThumbUpOutline className="size-4" />
                    )}
                    {p.upVotes}
                  </button>
                  <button
                    onClick={() => handleVote(p, false)}
                    className={classNames(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      p.currentUserVote === false
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                        : isDark 
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {p.currentUserVote === false ? (
                      <HandThumbDownIcon className="size-4" />
                    ) : (
                      <HandThumbDownOutline className="size-4" />
                    )}
                    {p.downVotes}
                  </button>

                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}