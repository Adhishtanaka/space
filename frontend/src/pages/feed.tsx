import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { api } from "../lib/api";
import type { Post } from "../lib/types";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

export default function Feed() {
  const { token, loading } = useAuth();
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
    const already = p.currentUserVote; // true, false or null
    // optimistic
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
      // reload on error
      const data = await api.getFeed(token);
      setFeed(data);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded border border-gray-200 bg-white p-4">
        <form onSubmit={submitPost} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share what's on your mind..."
            className="w-full min-h-24 rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-end">
            <button
              disabled={posting || !content.trim()}
              className="inline-flex items-center gap-2 rounded bg-[#5296dd] text-white px-3 py-2 text-sm font-medium hover:bg-[#5296dd]/90 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="size-4" /> Post
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {feed.length === 0 ? (
          <div className="text-center text-gray-600">
            No posts yet. Follow people or create your first post.
          </div>
        ) : (
          feed.map((p) => (
            <article
              key={p.id}
              className="rounded border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 text-sm text-gray-500">
                {p.userFirstName} {p.userLastName} •{" "}
                <span>{new Date(p.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-[15px]">{p.content}</p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <button
                  onClick={() => handleVote(p, true)}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[#92bddf]/10 ${p.currentUserVote === true ? "text-[#5296dd]" : "text-gray-700"}`}
                >
                  <HandThumbUpIcon className="size-4" /> {p.upVotes}
                </button>
                <button
                  onClick={() => handleVote(p, false)}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[#92bddf]/10 ${p.currentUserVote === false ? "text-[#5296dd]" : "text-gray-700"}`}
                >
                  <HandThumbDownIcon className="size-4" /> {p.downVotes}
                </button>
                
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
