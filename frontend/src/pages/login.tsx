import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../lib/useAuth";
import { LockClosedIcon, AtSymbolIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/feed", { replace: true });
    } catch (err: unknown) {
      setError((err as Error)?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          Welcome back
        </h1>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Email</span>
            <div className="relative">
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
                placeholder="you@example.com"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Password</span>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
                placeholder="••••••••"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#5296dd] text-white py-2 font-medium hover:bg-[#5296dd]/90 disabled:opacity-50"
          >
            Log in
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          New to Space?{" "}
          <Link className="text-[#5296dd] hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
