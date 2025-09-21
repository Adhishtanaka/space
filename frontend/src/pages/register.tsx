import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../lib/useAuth";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register({
        ...form,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
      });
      navigate("/feed", { replace: true });
    } catch (err: unknown) {
      setError((err as Error)?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          Create your account
        </h1>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-gray-600">First name</span>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
                  placeholder="John"
                />
              </div>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-600">Last name</span>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
                  placeholder="Doe"
                />
              </div>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Email</span>
            <div className="relative">
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
                placeholder="you@example.com"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Phone number</span>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                required
                className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
                placeholder="+1234567890"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Date of birth</span>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                required
                className="w-full rounded border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Password</span>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
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
            Create account
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="text-[#5296dd] hover:underline" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
