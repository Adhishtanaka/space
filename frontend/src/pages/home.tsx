import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../lib/useAuth";

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/feed", { replace: true });
  }, [token, navigate]);

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="max-w-2xl text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded bg-[#5296dd] text-white grid place-items-center text-2xl font-bold">
          S
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Space</h1>
        <p className="mt-2 text-gray-600">
          A minimal social feed with upvotes, downvotes, and follows. No
          clutter. Just posts.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2 rounded bg-[#5296dd] text-white hover:bg-[#5296dd]/90"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded border border-gray-300 hover:bg-[#92bddf]/10"
          >
            Log in
          </Link>
        </div>
        
      </div>
    </div>
  );
}
